const { client_id, client_secret, token, production, prodHostname, prodRedirect, devRedirect, prodOAuth2, devOAuth2, joinGuildID, guildRoleID, logsWebhook } = require("./config.json")

const redirectURL = production ? prodRedirect : devRedirect
const OAuth2URL = production ? prodOAuth2 : devOAuth2

const { Client, GatewayIntentBits, WebhookClient, EmbedBuilder, ActivityType } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
    ]
})
const logs = new WebhookClient({ url : logsWebhook })

const PqkoDiscord = require("pqko-discord")
const pqko = new PqkoDiscord.SlashCommands(token, client_id, client_secret, client)

/**
 * 
 * @param {EmbedBuilder} embed 
 */
const embed = (embed) => {
    return embed.setTitle("Pqko XYZ - Joiner").setFooter({ text: "Created by Pqko#0117" }).setTimestamp()
}

pqko.login()

pqko.folderHandler("commands")

client.on("ready", () => {
    client.user.setActivity("over verifications", {
        type: ActivityType.Listening
    })
    client.user.setStatus("dnd")
    console.log("READY")
})

const express = require("express")
const app = express()
const hbs = require("hbs")
const comp = require("compression")

// hbs.registerPartials("partials")

app.listen(9552)


app.use(require("express-rate-limit").rateLimit({
    windowMs: 10 * 1000,
    max: 20,
    message: "Website has been rate limited! Please wait 10 seconds.",
}))
app.use(comp({
    level: 8
}))
// app.use((req, res, next) => {
//     if(production == true) {
//         if(req.hostname !== prodHostname) return res.redirect("https://" + prodHostname + "/")
//     } else next()
// })
app.engine(".hbs", hbs.__express)
app.set("view engine", ".hbs")
app.use("/assets", express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/redirect", (req, res) => {
    if(req.query.code) {
        res.render("oauth")
    } else {
        res.redirect(OAuth2URL)
    }
})

app.post("/api/join", async (req, res) => {
    const code = req.body.code;

    const { access_token, scope } = await OAuth2.codeValidation(code)

    if(!access_token || !scope) return res.send({ message: 5, fixable: true, __note: "Failed to authenticate / code received is incorrect! Contact Owner for more help (Pqko#0117)" })

    if(!scope.includes("guilds.join")) return res.send({ message: 5, fixable: true, __note: "Missing 'guilds.join'!"})
    if(!scope.includes("identify")) return res.send({ message: 5, fixable: true, __note: "Missing 'identify'!" })

    const { id, username, discriminator }  = await OAuth2.getUser(access_token)

    if(!id) return res.send({ message: 5, fixable: true, __note: "Failed to fetch user ID! Missing 'identify'!" })

    const guild = await client.guilds.fetch(joinGuildID);
    const member = await guild.members.fetch(id).then((x) => {
        return res.send({ message: 9, fixable: false, __note: "You are already in the server!" })
    }).catch(async(x) => {
        const { joined_at } = await OAuth2.joinServer(joinGuildID, id, access_token)

        if(!joined_at) return logs.send({ embeds: [ embed(new EmbedBuilder()).setDescription(`<@${id}> (${username}#${discriminator}) failed to add! <@1009509873102372994>`) ] }),
             res.send({ message: 5, fixable: true, __note: "Failed to add to guild! Bot missing permission! Contact owner at Pqko#0117 / admin@pqko.xyz" })
        
        await (await guild.members.fetch(id)).roles.add(guildRoleID).catch(async (x) => {
            logs.send({
                embeds: [
                    embed(new EmbedBuilder()).setDescription(`Couldn't add role to <@${id}>!`)
                ]
            })
            return res.send({ message: 3, __note: "Failed to verify you on our discord server! DM a staff member to verify you!" })
        }) 
    
        res.send({ message: 1, __note: "You have been added to the server and been verified!" })

        return logs.send({
            embeds: [
                embed(new EmbedBuilder()).setDescription(`<@${id}> has been verified!`)
            ]
        })
    });
})

app.use((req, res, next) => {
    res.status(404).render("unknown")
})

logs.send({
    embeds: [
        embed(new EmbedBuilder()).setDescription("Ready to verify!").setColor("Green")
    ]
})