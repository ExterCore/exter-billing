fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'sobing'
description 'billing system like nopixel 4.0'

version '1.0'

ui_page 'html/index.html'

shared_scripts {
	'shared/cores.lua',
	'shared/locale.lua',
    'locales/en.lua',
    'locales/*.lua',
    'shared/config.lua'
}

client_scripts {
	'client/*.lua'
}

server_scripts {
	'@oxmysql/lib/MySQL.lua',
	'server/*.lua'
}

files {'html/**'}