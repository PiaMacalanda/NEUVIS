import supabase from "@/app/lib/supabaseClient";
import { visit } from "../../types/visits";

/**
 * Inserts notification to the Database for the visits expiration without timeout
 * @param {visit} - visit object for security_id and visit_id
 * @param {content} - content of the notification to be inserted
 */
export const insertVisitExpirationNotificationWithoutTimeout = async (visit: visit, content: string) => {
    try {
        if (!visit) throw new Error('No visit found');
    
        const security_id = visit.security_id;
        const visit_id = visit.id;
    
        const { data: existingNotification, error: selectError } = await supabase
            .from('notifications')
            .select("*")
            .eq('user_id', security_id)
            .eq('visit_id', visit_id);
    
        if (selectError) {
            throw new Error('Error during select query: ' + selectError.message);
        }

        if (existingNotification && existingNotification.length > 0) {
            throw new Error('Notification already sent!');
        }
    
        const { error: insertError } = await supabase
            .from('notifications')
            .insert([{ user_id: security_id, visit_id, read: false, content }]);
    
        if (insertError) {
            throw new Error('Error Inserting Notification: ' + insertError.message);
        }

        console.log(visit);

        const {error: updateError} = await supabase
            .from('visits')
            .update({ notification_sent: true })
            .eq('id', visit_id)
            .eq('security_id', security_id);

        if (updateError) {
            throw new Error('Error Updating Column: ' + updateError.message);
        }

    } catch (error) {
        console.error('Error during Notification insertion: ', error);
    }
};


export const fetchUserNotifications = async (user: any) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id);
        
        if(error) throw new Error('Error during fetching User Notifications: ', error);

        console.log(data);
        return data;
    } catch (error) {
        console.error('Error during Notification fetching: ', error);
    }
}