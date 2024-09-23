local nearbyPlayers = {}
local requestActive = false
if Config.InvoiceMenu.Keybinding.Enable then
    RegisterKeyMapping(Config.InvoiceMenu.Command, Config.InvoiceMenu.Keybinding.Description, "keyboard", Config.InvoiceMenu.Keybinding.Key)
end
RegisterCommand(Config.InvoiceMenu.Command, function()
    local myJob = GetPlayerJob()
    for k, v in pairs(Config.InvoiceJobs) do
        if k == myJob then
            nearbyPlayers = GetPlayersInArea(GetEntityCoords(PlayerPedId()), 5.0)
            if next(nearbyPlayers) ~= nil and next(nearbyPlayers) then
                requestActive = true
                exports["exter-textui"]:displayTextUI(Lang:t("general.waiting_for_decision"), "ESC")
                for _, id in pairs(nearbyPlayers) do
                    exports['exter-textui']:create3DTextUIOnPlayers("exter-billing-request-players-" .. id, {
                        id = id,
                        displayDist = 5.0,
                        interactDist = 1.3,
                        enableKeyClick = true, -- If true when you near it and click key it will trigger the event that you write inside triggerData
                        keyNum = 38,
                        key = "E",
                        text = "Send Invoice",
                        theme = "green", -- or red
                        triggerData = {
                            triggerName = "exter-billing:openInvoiceMenu:client",
                            args = {id = id}
                        }
                    })
                end
                Citizen.CreateThread(function()
                    while requestActive do
                        Citizen.Wait(0)
                        if IsControlPressed(0, 322) then
                            Notify(Lang:t("general.request_cancelled"), 7500, "error")
                            requestActive = false
                            exports["exter-textui"]:hideTextUI()
                            for _, id in pairs(nearbyPlayers) do
                                exports['exter-textui']:delete3DTextUIOnPlayers("exter-billing-request-players-" .. id)
                            end
                        end
                    end
                end)
                Citizen.SetTimeout(7500, function()
                    if requestActive then
                        Notify(Lang:t("general.request_timed_out"), 7500, "error")
                        requestActive = false
                        exports["exter-textui"]:hideTextUI()
                        for _, id in pairs(nearbyPlayers) do
                            exports['exter-textui']:delete3DTextUIOnPlayers("exter-billing-request-players-" .. id)
                        end
                    end
                end)
            else
                Notify(Lang:t("general.no_players_nearby"), 7500, "error")
            end
            return true
        end
    end
    Notify(Lang:t("general.no_access"), 7500, "error")
end)

RegisterNetEvent('exter-billing:openInvoiceMenu:client', function(data)
    local myJob = GetPlayerJob()
    local translations = {}
    for k in pairs(Lang.fallback and Lang.fallback.phrases or Lang.phrases) do
        if k:sub(0, ('menu.'):len()) then
            translations[k:sub(('menu.'):len() + 1)] = Lang:t(k)
        end
    end
    TriggerCallback('exter-billing:getTargetName:server', function(name)
        SetNuiFocus(true, true)
        SendNUIMessage({action = "openInvoiceMenu", taxRate = Config.InvoiceJobs[myJob].taxRate, text = data.id .. " (" .. name .. ")", target = data.id, maxVal = tonumber(Config.MaxInvoiceValue), translations = translations})
    end, data.id)
    requestActive = false
    exports["exter-textui"]:hideTextUI()
    for _, id in pairs(nearbyPlayers) do
        exports['exter-textui']:delete3DTextUIOnPlayers("exter-billing-request-players-" .. id)
    end
end)

RegisterNUICallback('callback', function(data)
    if data.action == "nuiFocus" then
        SetNuiFocus(false, false)
    elseif data.action == "sendInvoice" then
        local myJob = GetPlayerJob()
        local addVal = data.price * Config.InvoiceJobs[myJob].taxRate / 100
        data.price = addVal + data.price
        TriggerServerEvent('exter-billing:sendInvoice:server', data.target, data.price, myJob, data.title)
    elseif data.action == "payBill" then
        TriggerServerEvent('exter-billing:payBill:server', data.id, data.amount, data.type, data.sender)
    end
end)

if Config.BillsMenu.Keybinding.Enable then
    RegisterKeyMapping(Config.BillsMenu.Command, Config.BillsMenu.Keybinding.Description, "keyboard", Config.BillsMenu.Keybinding.Key)
end
RegisterCommand(Config.BillsMenu.Command, function()
    openBillsMenu()
end)

function openBillsMenu()
    TriggerCallback('exter-billing:getMyBills:server', function(myBills)
        --if myBills then
            local translations = {}
            for k in pairs(Lang.fallback and Lang.fallback.phrases or Lang.phrases) do
                if k:sub(0, ('menu.'):len()) then
                    translations[k:sub(('menu.'):len() + 1)] = Lang:t(k)
                end
            end
            SetNuiFocus(true, true)
            local data = {}
            for k, v in pairs(myBills) do
                local paid = false
                if tonumber(v.paid) == 1 then
                    paid = true
                end
                local tax = 0
                if Config.InvoiceJobs[v.type] then
                    tax = Config.InvoiceJobs[v.type].taxRate
                end
                table.insert(data, {
                    id = v.id,
                    type = v.type,
                    asset = v.title,
                    amount = v.price,
                    paid = paid,
                    owner = v.owner,
                    taxRate = tax
                })
            end
            table.sort(data, function(a, b) return a.id > b.id end)
            SendNUIMessage({action = "openMenu", data = data, translations = translations})
        --else
            --Notify(Lang:t("general.no_bill"), 7500, "error")  
        --end
    end)
end

RegisterNetEvent('exter-billing:updateBills:client', function(myBills)
    local data = {}
    for k, v in pairs(myBills) do
        local paid = false
        if tonumber(v.paid) == 1 then
            paid = true
        end
        table.insert(data, {
            id = v.id,
            type = v.type,
            asset = v.title,
            amount = v.price,
            paid = paid,
            owner = v.owner
        })
    end
    table.sort(data, function(a, b) return a.id > b.id end)
    SendNUIMessage({action = "updateBills", data = data})
end)

function GetPlayers(onlyOtherPlayers, returnKeyValue, returnPeds)
    local players, myPlayer = {}, PlayerId()
    local active = GetActivePlayers()
    for i = 1, #active do
        local currentPlayer = active[i]
        local ped = GetPlayerPed(currentPlayer)
        if DoesEntityExist(ped) and ((onlyOtherPlayers and currentPlayer ~= myPlayer) or not onlyOtherPlayers) then
            if returnKeyValue then
                players[currentPlayer] = {entity = ped, id = GetPlayerServerId(currentPlayer)}
            else
                players[#players + 1] = returnPeds and ped or currentPlayer
            end
        end
    end
    return players
end

function EnumerateEntitiesWithinDistance(entities, isPlayerEntities, coords, maxDistance)
    local nearbyEntities = {}
    if coords then
        coords = vector3(coords.x, coords.y, coords.z)
    else
        local playerPed = PlayerPedId()
        coords = GetEntityCoords(playerPed)
    end
    for k, v in pairs(entities) do
        local distance = #(coords - GetEntityCoords(v.entity))
        if distance <= maxDistance then
            nearbyEntities[#nearbyEntities + 1] = v.id
        end
    end
    return nearbyEntities
end

function GetPlayersInArea(coords, maxDistance)
    return EnumerateEntitiesWithinDistance(GetPlayers(true, true), true, coords, maxDistance)
end