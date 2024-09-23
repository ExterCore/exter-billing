-- English
local Translations = {
    menu = {
        type = "Type",
        asset = "Asset",
        pay_bill = "Pay Bill",
        title1 = "TAXES & BILL MANAGEMENT",
        bottomtitle = "Bills & Taxes",
        description1 = "Manage all your bills and tax payments in a single place!",
        menutitle1 = "Outstanding Bills or Taxes",
        menutitle2 = "History of Bills or Taxes",
        title2 = "TAXES & BILL CREATE",
        description2 = "Create and manage all your invoices effortlessly!",
        invoice_title_input = "Title (max 20 character)",
        invoice_title_input_placeholder = "Invoice title here...",
        invoice_amount_input = "Amount (1$-99999$)",
        invoice_target_player_input = "Target Player",
        approve = "Approve"
    },
    general = {
        waiting_for_decision = "Waiting for a desicion. Cancel",
        request_cancelled = "Request cancelled.",
        request_timed_out = "Request timed out.",
        no_players_nearby = "No players nearby.",
        no_bill = "No bills or taxes found.",
        no_access = "You don't have access to this menu."
    }
}

Lang = Lang or Locale:new({
    phrases = Translations,
    warnOnMissing = true
})