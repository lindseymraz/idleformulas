import { getGlobalMultiplier } from '../savestate';
import { mailDictionary } from './MailDictionary';

//Mail Status:
//ForCheck: Will be sent out once certain criteria are met
//Pending: Mail is sent out and will be received after a delay
//Received: Every mail that has been received
//Unread: Mail is received but not yet read
//Completed: Mail is responded by user
//Timeout: Some mails trigger complete automatically after a certain time
//Status changes are able to set follow up mails into ForCheck status

export const checkNewMails = (state)=>{
    for (let i = state.mailsForCheck.length - 1; i >= 0; i--) {
        const mailid = state.mailsForCheck[i]
        const mail = mailDictionary[mailid]
        if (mail.abandon?.(state)) {
            state.mailsForCheck.splice(i, 1)
        } else if (!mail.check || mail.check(state)) {
            state.mailsPending.push({mailid:mailid, sentTime:Date.now()})
            state.mailsForCheck.splice(i, 1)
            if (mail.afterCheck)
                state.mailsForCheck = state.mailsForCheck.concat(mail.afterCheck)
        }
    }
}

export const updatePendingMails = (state)=>{
    let gotNewMail = false
    for (let i = state.mailsPending.length - 1; i >= 0; i--) {
        const mailid = state.mailsPending[i].mailid
        const mail = mailDictionary[mailid]
        if (!mail.delay || Date.now() - state.mailsPending[i].sentTime > 1000 * mail.delay / getGlobalMultiplier(state)) {
            if (state.mailsReceived[mailid] || mail.abandon?.(state)) { //Safety Check to prevent duplicate Mails
                state.mailsPending.splice(i, 1)
                continue
            }
            if (!mail.silent)
                gotNewMail = true
            state.mailsUnread[mailid] = true
            state.mailsReceived[mailid] = true
            state.mailsList.unshift(mailid)
            state.mailsPending.splice(i, 1)
            if (mail.afterReceive)
                state.mailsForCheck = state.mailsForCheck.concat(mail.afterReceive)
            if (mail.getProgress)
                state.mailsProgress[mailid] = mail.getProgress()
        }
    }
    return gotNewMail
}

export const markAsRead = (state, mailid)=>{
    const mail = mailDictionary[mailid]
    if (mail.afterRead)
        state.mailsForCheck = state.mailsForCheck.concat(mail.afterRead)
    if (mail.afterReadConditional)
        state.mailsForCheck = state.mailsForCheck.concat(mail.afterReadConditional(state))
    if (mail.timeout)
        state.mailsForTimeout.push({mailid: mail.id, timestamp: Date.now()})
    delete state.mailsUnread[mailid]
}

export const progressMail = (state, mailid, path, subpath, value)=>{
    if (subpath !== undefined)
        state.mailsProgress[mailid][path][subpath] = value
    else if (path !== undefined)
        state.mailsProgress[mailid][path] = value
    else
        state.mailsProgress[mailid] = value

}

export const completeMail = (state, mailid, reply)=>{
    if (state.mailsCompleted[mailid])
        return

    const mail = mailDictionary[mailid]
    if (mail.afterComplete) {
        if (reply !== undefined)
            state.mailsForCheck = state.mailsForCheck.concat(mail.afterComplete[reply])
        else
            state.mailsForCheck = state.mailsForCheck.concat(mail.afterComplete)
    }
    state.mailsCompleted[mailid] = reply === undefined ? true : reply

    delete state.mailsUnread[mailid]

    if (mail.effects && mail.effects[reply])
        mail.effects[reply](state)
}

export const unlockMail = (state, mailid)=>{
    const mail = mailDictionary[mailid]
    if (state.alpha < mail.alphaCost) 
        return

    state.alpha -= mail.alphaCost
    state.mailsUnlocked[mailid] = true
}

export const checkTimeouts = (state)=>{
    for (let i = state.mailsForTimeout.length - 1; i >= 0; i--) {
        const mailid = state.mailsForTimeout[i].mailid
        const timestamp = state.mailsForTimeout[i].timestamp
        const mail = mailDictionary[mailid]
        if (Date.now() - timestamp >= mail.timeout * 1000 / getGlobalMultiplier(state)) {
            state.mailsForTimeout.splice(i, 1)
            if (!state.mailsCompleted[mailid])
                completeMail(state, mailid, mail.getTimeoutReply(state))
        }
    }
}