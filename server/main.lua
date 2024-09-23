CreateCallback('exter-billing:getTargetName:server', function(source, cb, id)
    cb(GetCharName(id, true))
end)

CreateCallback('exter-billing:getMyBills:server', function(source, cb)
    local src = source
    --local me = GetPlayer(src)
    local myBills = MySQL.query.await('SELECT * FROM exter_billing WHERE receiver = ?', {GetPlayerLicense(src)})
    if myBills and next(myBills) then
        cb(myBills)
    else
        cb({})
    end
end)

RegisterNetEvent('exter-billing:sendInvoice:server', function(id, price, type, title)
    local src = source
    local me = GetPlayer(src)
    local target = id
    local targetPlayer = GetPlayer(target)
    if not targetPlayer then return Notify(src, "Target not active.", 7500, "error") end
    Notify(src, "You've invoiced $" .. price .. ".", 7500, "error")
    Notify(target, "You received a $" .. price .. " bill.", 7500, "error")
    MySQL.insert('INSERT INTO exter_billing (owner, paid, price, receiver, title, type) VALUES (:owner, :paid, :price, :receiver, :title, :type)', {
        owner = GetPlayerLicense(src),
        paid = false,
        price = price,
        receiver = GetPlayerLicense(target),
        title = title,
        type = type
    })
end)

RegisterNetEvent('exter-billing:payBill:server', function(id, amount, type, sender)
    local src = source
    local myMoney = GetPlayerMoney(src, "bank")
    if myMoney >= amount then
        RemoveMoney(src, "bank", amount, "pay-bill")
        MySQL.update('UPDATE exter_billing SET paid = ? WHERE id = ?', {true, id})
        Citizen.Wait(500)
        local myBills = MySQL.query.await('SELECT * FROM exter_billing WHERE receiver = ?', {GetPlayerLicense(src)})
        TriggerClientEvent('exter-billing:updateBills:client', src, myBills)
        if Config.InvoiceJobs[type] then
            if Config.InvoiceJobs[type].society then
                local senderMoney = amount * Config.InvoiceJobs[type].commision / 100
                local player = GetPlayerByCid(sender)
                if player then
                    local id = nil
                    if CoreName == "qb-core" or CoreName == "qbx_core" then
                        AddMoney(player.PlayerData.source, "bank", math.floor(senderMoney + 0.5), "bill-commision")
                    elseif CoreName == "es_extended" then
                        AddMoney(player.source, "bank", math.floor(senderMoney + 0.5), "bill-commision")
                    end
                else
                    AddMoneyOffline(sender, math.floor(senderMoney + 0.5))
                end
            else
                local senderMoney = amount * Config.InvoiceJobs[type].commision / 100
                Config.AddMoneyManagement(type, math.floor(senderMoney + 0.5))
            end
        end
    else
        Notify(src, "You don't have enough money.", 7500, "error")  
    end
end)

Citizen.CreateThread(function()
    local table = MySQL.query.await("SHOW TABLES LIKE 'exter_billing'", {}, function(rowsChanged) end)
    if next(table) then else
        MySQL.query.await([[CREATE TABLE IF NOT EXISTS `exter_billing` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `paid` varchar(50) NOT NULL DEFAULT '0',
        `owner` varchar(50) NOT NULL DEFAULT '0',
        `price` int(17) DEFAULT NULL,
        `receiver` varchar(50) DEFAULT NULL,
        `title` varchar(50) DEFAULT NULL,
        `type` varchar(50) DEFAULT NULL,
        PRIMARY KEY (`id`)
        ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;]], {}, function(rowsChanged) end)
    end
end)