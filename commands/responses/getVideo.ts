import {AttachmentBuilder, Message, type OmitPartialGroupDMChannel} from "discord.js";
import {type videoUrls, extractInstagramUrl, mergeVideoAudioUrl} from "../../modules/videoExtract-api.ts";
import type {Readable} from "stream";

export async function getVideo(message :  OmitPartialGroupDMChannel<Message<boolean>>){

    const initialMessage = await message.reply("Working on it..");
    switch ((new RegExp("^(?:http://|https://)([^/]*).*").exec(message.content)?? ["",""])[1]) {
        case "www.instagram.com": {
            const urls : videoUrls = await extractInstagramUrl(message.client.browserContext, (new RegExp("^([^?]*)").exec(message.content)![1]!))
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