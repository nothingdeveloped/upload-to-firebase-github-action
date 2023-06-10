import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

export default async function webhook(config,url) {
    //if(validateConfig(config))
    try {
        const res = await axios({
            method : 'POST',
            url : '',
            headers : {
                "Content-Type" : "application/json",
                "X-API-KEY" : "key"
            },
            data : {
                url : url
            }
        })
    } catch (err) {
        console.log(err)
    }
   
}

function validateConfig(config) {
    return (config.hasOwnProperty('method') && config.hasOwnProperty('url')) 
}