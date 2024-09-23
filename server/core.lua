Core = nil
CoreName = nil
CoreReady = false
Citizen.CreateThread(function()
    for k, v in pairs(Cores) do
        if GetResourceState(v.ResourceName) == "starting" or GetResourceState(v.ResourceName) == "started" then
            CoreName = v.ResourceName
            Core = v.GetFramework()
            CoreReady = true
        end
    end
end)

function GetPlayer(source)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayer(source)
        return player
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(source)
        return player
    end
end

function GetPlayerByCid(cid)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayerByCitizenId(cid)
        return player
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromIdentifier(cid)
        return player
    end
end

function GetPlayerJob(source)
    local src = tonumber(source)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayer(src)
        if player then
            return player.PlayerData.job
        else
            return false
        end
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(src)
        if player then
            return player.job
        else
            return false
        end
    end
end

function GetPlayerLicense(source)
    local src = tonumber(source)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayer(src)
        return player.PlayerData.citizenid
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(src)
        return player.getIdentifier()
    end
end

function GetCharName(source, charName)
    local src = tonumber(source)
    if charName then
        if CoreName == "qb-core" or CoreName == "qbx_core" then
            local player = Core.Functions.GetPlayer(src)
            if player then
                return player.PlayerData.charinfo.firstname .. " " .. player.PlayerData.charinfo.lastname
            else
                return ""
            end
        elseif CoreName == "es_extended" then
            local player = Core.GetPlayerFromId(src)
            if player then
                return player.getName()
            else
                return ""
            end
        end
    else
        return GetPlayerName(src)
    end
end

function Notify(source, text, length, type)
    local src = tonumber(source)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        Core.Functions.Notify(src, text, type, length)
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(src)
        player.showNotification(text)
    end
end

function GetPlayerMoney(src, type)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayer(src)
        return player.PlayerData.money[type]
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(src)
        local acType = "bank"
        if type == "cash" then
            acType = "money"
        end
        --local account = player.getAccount(acType).money -- old esx
        local account = player.accounts
        for k, v in pairs(account) do
            if v.name == acType then
                return v.money
            end 
        end
        return account
    end
end

function AddMoney(src, type, amount, description)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayer(src)
        player.Functions.AddMoney(type, amount, description)
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(src)
        if type == "bank" then
            player.addAccountMoney("bank", amount, description)
        elseif type == "cash" then
            player.addMoney(amount, description)
        end
    end
end

function AddMoneyOffline(cid, amount)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = MySQL.query.await('SELECT * FROM players WHERE citizenid = ? LIMIT 1', {cid})
        if player[1] ~= nil then
            local playerMoneyData = json.decode(player[1].money)
            playerMoneyData.bank = playerMoneyData.bank + amount
            MySQL.update('UPDATE players SET money = ? WHERE citizenid = ?', {json.encode(playerMoneyData), cid})
        end
    elseif CoreName == "es_extended" then
        local player = MySQL.query.await('SELECT * FROM users WHERE identifier = ? LIMIT 1', {cid})
        if player[1] ~= nil then
            local playerMoneyData = json.decode(player[1].accounts)
            playerMoneyData.bank = playerMoneyData.bank + amount
            MySQL.update('UPDATE users SET money = ? WHERE identifier = ?', {json.encode(playerMoneyData), cid})
        end
    end
end

function RemoveMoney(src, type, amount, description)
    if CoreName == "qb-core" or CoreName == "qbx_core" then
        local player = Core.Functions.GetPlayer(src)
        player.Functions.RemoveMoney(type, amount, description)
    elseif CoreName == "es_extended" then
        local player = Core.GetPlayerFromId(src)
        if type == "bank" then
            player.removeAccountMoney("bank", amount, description)
        elseif type == "cash" then
            player.removeMoney(amount, description)
        end
    end
end

Config.ServerCallbacks = {}
function CreateCallback(name, cb)
    Config.ServerCallbacks[name] = cb
end

function TriggerCallback(name, source, cb, ...)
    if not Config.ServerCallbacks[name] then return end
    Config.ServerCallbacks[name](source, cb, ...)
end

RegisterNetEvent('exter-billing:server:triggerCallback', function(name, ...)
    local src = source
    TriggerCallback(name, src, function(...)
        TriggerClientEvent('exter-billing:client:triggerCallback', src, name, ...)
    end, ...)
end)