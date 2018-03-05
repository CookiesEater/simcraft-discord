"use strict";

const debug = require( 'debug' );
const error = debug( 'bot:error' );
const log = debug( 'bot:log' );
const moment = require( 'moment-timezone' );
const blizzard = require( 'blizzard.js' ).initialize( { apikey: process.env.BATTLE_NET_KEY }, {} );
const Discord = require( 'discord.js' );
const client = new Discord.Client();
const pawn = require( './helpers/Pawn' );
const ucfirst = require( './helpers/Ucfirst' );
const Simcarft = require( './components/Simcraft' );
const numeral = require( 'numeral' );
const locale = process.env.LOCALE ? process.env.LOCALE : 'ru_RU';
const timezone = process.env.TIMEZONE ? process.env.TIMEZONE : 'Europe/Moscow';
const reportsUrl = process.env.REPORTS_URL ? process.env.REPORTS_URL : '';

const SPEC_HEALING = 'HEALING';

moment.tz.setDefault( timezone );
moment.locale( locale );

log.log = console.log.bind( console );

client.on( 'ready', () => {
    log( 'I\'m ready! My id is %s', client.user.id );

    const simcraft = new Simcarft( '', '', '' );
    simcraft.info().then( ( data ) => {
        client.user.setGame( data );
    });
});

client.on( 'error', ( err ) => {
    error( 'Error: %s', err.toString() );
});

client.on( 'disconnect', ( event ) => {
    error( 'Disconnect: code %s, reason "%s"', event.code, event.reason );

    // Вход заново если discord закрыл соединение нормально
    if( event.code == 1000 )
        client.login( process.env.DISCORD_KEY );
});

client.on( 'reconnecting', () => {
    log( 'Trying to reconnect...' );
});

client.on( 'message', message => {
    if( !message.isMentioned( client.user ) )
        return;

    let scaling = false; // Флаг о том, проводить ли расчёт для pawn строки
    let enemies = 1; // Число врагов в симуляции

    log( 'New message %s', message.content );

    // Удаление упоминания и всего текста до него
    // TODO: наверняка есть вариант получше
    let messageContent = message.content.replace( /.*<@\d+>/, '' ).trim().toLowerCase();

    // Вычистка ненужных символов
    messageContent = messageContent.replace( /[.?!,]/g, '' ).trim();

    // Если просто выводим служебную информацию
    if( messageContent == 'инфо' )
    {
        log( 'Send info message' );
        const simcraft = new Simcarft( '', '', '' );
        simcraft.info().then( ( data ) => {
            message.channel.send( `Я использую версию симкрафт:\n${data}` );
        });

        return;
    }

    // Выяснение, надо ли проводить симуляцию для статов
    if( messageContent.indexOf( ' pawn' ) > 0 )
    {
        scaling = true;
        messageContent = messageContent.replace( / pawn/, '' ).trim();
    }

    // Выяснение в сколько целей будем проводить симуляцию
    if( messageContent.match( /(\d+) цел(ь|и|ей)/ ) )
    {
        enemies = parseInt( messageContent.match( /(\d+) цел(ь|и|ей)/ )[ 1 ] );
        enemies = enemies > 10 ? 10 : enemies;
        messageContent = messageContent.replace( /\d+ цел(ь|и|ей)/, '' ).trim();
    }

    // Сообщение пустое, дальше делать что-то бессмысленно
    if( !messageContent )
        return;

    // Выкусывание регуляркой имени персонажа, сервера и региона (два последних необязательны)
    let [ , name, ,realm = process.env.DEFAULT_REALM, , origin = process.env.DEFAULT_ORIGIN ] = messageContent.match( /^([^\-\s]+)([\-\s]+(.+?)([\-\s]+(eu|us|kr|tw))?)?$/i );

    log( 'Fetch information about character "%s", realm "%s", origin "%s"', name, realm, origin );
    blizzard.wow.character( [ 'talents' ], { origin: origin, realm: realm, name: name, locale: locale } )
        .then( ( response ) => {
            log( 'Success fetch data from Blizzard api' );

            // Поиск названия активной специализации
            const spec = response.data.talents.find( ( spec ) => {
                return spec.selected;
            }).spec;
            // Название для файла с итоговым отчётом
            const reportName = reportsUrl ? ( name.toLowerCase() + '-' + realm.toLowerCase().replace( /\s+/g, '-' ) + '-' + origin.toLowerCase() ) : '';

            // Если текущая специализация хила то только выводим что симкрафт не работает с ней
            if( spec.role === SPEC_HEALING )
            {
                log( 'Heal spec can\'t simulate' );
                message.reply( `Персонаж ${name}-${realm}-${origin} находится в специализации лекаря. SimulationCraft не умеет и не будет уметь считать HPS.` );
                return;
            }

            // Старт симуляции в докере
            log( 'Start simcraft for %s...', name );
            const simcraft = new Simcarft( name, realm, origin, reportName, scaling, enemies );
            simcraft.simulate().then( ( data ) => {
                log( 'Simulate for %s end successful', name );
                let embed = {
                    color: 1552707,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.avatarURL
                    },
                    description: `Симуляция для персонажа **${ucfirst( name )}-${ucfirst( realm )}-${origin}** завершена`,
                    thumbnail: {
                        url: `https://render-${origin}.worldofwarcraft.com/character/${response.data.thumbnail}`
                    },
                    fields: [],
                };

                if( enemies > 1 )
                {
                    embed.fields.push({
                        name: 'DPS:',
                        value: numeral( data.sim.players[ 0 ].collected_data.dps.mean ).format( '0.00a' ),
                        inline: true
                    });
                    embed.fields.push({
                        name: 'DPS (в основную цель):',
                        value: numeral( data.sim.players[ 0 ].collected_data.prioritydps.mean ).format( '0.00a' ),
                        inline: true
                    });
                }
                else
                {
                    embed.fields.push({
                        name: 'DPS:',
                        value: numeral( data.sim.players[ 0 ].collected_data.dps.mean ).format( '0.00a' ),
                        inline: true
                    });
                }

                if( scaling )
                {
                    let primaryStatName, primaryStatValue;
                    if( data.sim.players[ 0 ].scale_factors.Int )
                    {
                        primaryStatName = 'Intellect';
                        primaryStatValue = data.sim.players[ 0 ].scale_factors.Int;
                    }
                    else if( data.sim.players[ 0 ].scale_factors.Str )
                    {
                        primaryStatName = 'Strength';
                        primaryStatValue = data.sim.players[ 0 ].scale_factors.Str;
                    }
                    else if( data.sim.players[ 0 ].scale_factors.Agi )
                    {
                        primaryStatName = 'Agility';
                        primaryStatValue = data.sim.players[ 0 ].scale_factors.Agi;
                    }

                    embed.fields.push({
                        name: 'Вес статов:',
                        value: `\`\`\`${pawn( {
                            name: ucfirst( name ),
                            class: data.sim.players[ 0 ].specialization.match( /\s+(.+)/ )[ 1 ].replace( /\s+/, '' ),
                            spec: data.sim.players[ 0 ].specialization.split( ' ' )[ 0 ],
                            crit: data.sim.players[ 0 ].scale_factors.Crit,
                            haste: data.sim.players[ 0 ].scale_factors.Haste,
                            mastery: data.sim.players[ 0 ].scale_factors.Mastery,
                            versatility: data.sim.players[ 0 ].scale_factors.Vers,
                            primaryStatName: primaryStatName,
                            primaryStatValue: primaryStatValue
                        } ).toString()}\`\`\``
                    });
                }

                if( reportsUrl )
                {
                    embed.fields.push({
                        name: 'Подробнее:',
                        value: `${reportsUrl}/${reportName}.html`,
                    });
                }

                message.channel.send({ embed: embed });
            }, ( err ) => {
                error( 'An error during simulate %s: %s', name, err );
                message.reply( 'В процессе симуляции что-то пошло не так, скорая уже выехала.' );
            });

            message.channel.send({
                embed: {
                    color: 15265561,
                    author: {
                        name: message.author.tag,
                        icon_url: message.author.avatarURL
                    },
                    description: `Начинаю симуляцию для персонажа **${ucfirst( name )}-${ucfirst( realm )}-${origin}**`,
                    thumbnail: {
                        url: `https://render-${origin}.worldofwarcraft.com/character/${response.data.thumbnail}`
                    },
                    fields: [
                        {
                            name: 'Количество целей:',
                            value: enemies.toString(),
                            inline: true
                        },
                        {
                            name: 'Текущая специализация:',
                            value: spec.name,
                            inline: true
                        },
                        {
                            name: 'Последнее обновление персонажа:',
                            value: moment( response.data.lastModified ).format( 'DD MMM YYYY г., HH:mm:ss Z' ),
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'Симуляция займёт какое-то время...'
                    }
                }
            });
        }, ( err ) => {
            error( 'Fail fetch data from Blizzard api. Status: %s, reason: %s', err.response.data.status, err.response.data.reason );

            message.reply( `Blizzard говорит что персонажа ${name}-${realm}-${origin} нет. Где-то ошибка в имени?` );
        });
});

client.login( process.env.DISCORD_KEY );
