import {AttachmentBuilder, Message, type OmitPartialGroupDMChannel} from "discord.js";
import {type videoUrls, extractInstagramUrl, mergeVideoAudioUrl} from "../../modules/videoExtract-api.ts";
import type {Readable} from "stream";

export async function getVideo(message :  OmitPartialGroupDMChannel<Message<boolean>>){

    const initialMessage = await message.reply("Working on it..");
    switch ((new RegExp("^(?:http://|https://)([^/]*).*").exec(message.content)?? ["",""])[1]) {
        case "www.instagram.com": {
            const context = await message.client.browser.newContext()
            const urls : videoUrls = await extractInstagramUrl(context, message.content)
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

    // }catch (err) {
    //     const error : Error = (err as Error)
    //     if (error.message.startsWith("page.goto: Target page, context or browser has been closed") && !retry){
    //         await initialMessage.edit(`Error occurred: Target page, \'context or browser has been closed\' retrying..`)
    //         console.log(`Error -has been closed- context: ${!message.client.browserContext.isClosed()}; browser ${!message.client.browserContext.isClosed()}`);
    //         await message.client.browser.close()
    //         message.client.browser = await chromium.launch();
    //         message.client.browserContext = await message.client.browser.newContext();
    //         await getVideo(message, true)
    //
    //     }else{
    //         console.log(`Error -has been closed- context: ${!message.client.browserContext.isClosed()}; browser ${!message.client.browserContext.isClosed()}`);
    //         await initialMessage.edit("żegnaj okrutny świecie")
    //         throw error;
    //     }
}