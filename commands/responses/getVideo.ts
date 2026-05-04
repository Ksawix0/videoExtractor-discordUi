import {AttachmentBuilder, Message, type OmitPartialGroupDMChannel} from "discord.js";
import {type videoUrls, extractInstagramUrl, mergeVideoAudioUrl} from "../../modules/videoExtract-api.ts";
import type {Readable} from "stream";

export async function getVideo(message :  OmitPartialGroupDMChannel<Message<boolean>>){

    const initialMessage = await message.reply("Working on it..");
    switch ((new RegExp("^(?:http://|https://)([^/]*).*").exec(message.content)?? ["",""])[1]) {
        case "www.instagram.com": {
            const context = await message.client.browser.newContext({viewport: { width: 1920, height: 1080 }, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"})
            const urls : videoUrls = await extractInstagramUrl(context, (new RegExp("^([^?]*)").exec(message.content)![1]!))
            await context.close()
            await mergeVideoAudioUrl(urls.videoUrl, urls.audioUrl, async (stream : Readable)=>{
                await message.reply({content: "", files:[new AttachmentBuilder(stream, {name: "video.mp4"})]})
                await initialMessage.delete()
            })
        }break;

        default: {
            await initialMessage.delete();
        }
    }
}