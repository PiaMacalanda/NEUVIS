import supabase from "@/app/lib/supabaseClient"
import { visit } from "../../types/visits";

/**
 * Fetches Expired Untimedout Visits Data from the database
 * @param {user} - user data to fetch visits for the current security user
 * @returns {Promise<visits[]>} - returns a list of expired untimedout visits for the security that inserted the visit
 */
export const fetchExpiredUntimedoutVisits = async (user: any) => {
    const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('security_id', user.id)
        .lt('expiration', new Date().toISOString())
        .is('time_out', null);
    
    if (error) {
        console.error('Error fetching expired visits:', error);
        return [];
    }

    return data as visit[];
}

/**
 * Fetches Expired Untimedout Visits without Notification sent just yet Data from the database
 * @param {user} - user data to fetch visits for the current security user
 * @returns {Promise<visits[]>} - returns a list of expired untimedout visits for the security 
 *                                that inserted the visit where notification hasn't been sent yet
 */
export const fetchExpiredUntimedoutVisitsWithNoNotificationsSentYet = async (user: any) => {
    const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('security_id', user?.id)
        .lte('expiration', new Date().toISOString())
        .is('time_out', null)
        .is('notification_sent', false);
    
    if (error) {
        console.error('Error fetching expired visits without notification:', error);
        return [];
    }

    return data as visit[];
}