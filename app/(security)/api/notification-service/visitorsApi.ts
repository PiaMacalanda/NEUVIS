import { supabase } from '../../../lib/supabaseClient';

export interface Visitor {
  id: number;
  name: string;
  time_of_visit: string;
  time_out?: string;
  visit_id: string;
  purpose_of_visit?: string;
  phone_number?: string;
  card_type?: string;
  id_number?: string;
  visit_count?: number;
  expiration?: string;
  visitors?: {
    id: number;
    name: string;
    phone_number?: string;
    card_type?: string;
    id_number?: string;
  };
  formatted_time_of_visit?: string;
  formatted_time_out?: string;
}

// Format date for display
export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Format time for display
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
}

// Check if a visitor pass is expired
export const isVisitorExpired = (visitor: Visitor): boolean => {
  // If the visitor has an expiration field, use it
  if (visitor.expiration) {
    const expirationDate = new Date(visitor.expiration);
    const now = new Date();
    return now > expirationDate;
  }
  
  // If no expiration date is available, fall back to the 10 PM same day logic
  const visitDate = new Date(visitor.time_of_visit);
  
  // Set expiration to 10 PM (22:00) on the same day
  const expirationDate = new Date(visitDate);
  expirationDate.setHours(22, 0, 0, 0);
  
  // Adjust for timezone if needed
  const expirationPht = new Date(expirationDate.getTime() - (8 * 60 * 60 * 1000));
  
  const now = new Date();
  return now > expirationPht;
};

// Define interfaces for database responses
interface VisitorRecord {
  id: number;
  name: string;
  phone_number?: string | null;
  card_type?: string | null;
  id_number?: string | null;
}

interface VisitRecord {
  id: number;
  time_of_visit: string;
  time_out?: string | null;
  visit_id: string;
  purpose_of_visit?: string | null;
  expiration?: string | null;
  visitors?: VisitorRecord | null;
  created_at: string;
}

export const fetchVisitors = async (selectedDate: Date, activeTab: string) => {
  try {
    // Get start and end of selected date
    const startOfDay = new Date(new Date(selectedDate).setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(new Date(selectedDate).setHours(23, 59, 59, 999)).toISOString();
    
    // Modified query to fetch more visitor details including expiration
    let query = supabase
      .from('visits')
      .select(`
        id,
        time_of_visit,
        time_out,
        visit_id,
        purpose_of_visit,
        expiration,
        created_at,
        visitors(
          id, 
          name, 
          phone_number, 
          card_type, 
          id_number
        )
      `)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);
    
    // Filter based on active tab
    if (activeTab === 'ongoing') {
      query = query.is('time_out', null);
    } else {
      query = query.not('time_out', 'is', null);
    }
    
    const { data, error } = await query.order('time_of_visit', { ascending: false });
    
    if (error) throw error;

    // Transform data with comprehensive visitor details and filter out expired visitors
    const formattedData = (data as unknown as VisitRecord[])
      .filter(item => item.visitors !== null)
      .map(item => ({
        id: item.id,
        name: item.visitors?.name || 'Unknown Visitor',
        time_of_visit: item.time_of_visit,
        formatted_time_of_visit: formatDateTime(item.time_of_visit),
        time_out: item.time_out || undefined,
        formatted_time_out: item.time_out ? formatDateTime(item.time_out) : undefined,
        visit_id: item.visit_id,
        purpose_of_visit: item.purpose_of_visit || '',
        phone_number: item.visitors?.phone_number || '',
        card_type: item.visitors?.card_type || '',
        id_number: item.visitors?.id_number || '',
        visit_count: 3, // This would ideally be dynamically fetched
        expiration: item.expiration || undefined
      } as Visitor))
      .filter(visitor => {
        // If it's an ongoing visit, don't show expired passes
        if (activeTab === 'ongoing') {
          return !isVisitorExpired(visitor);
        }
        // For completed visits, only show those that have been properly checked out
        // and don't include expired but unchecked visitors
        return visitor.time_out;
      })
      .map(visitor => ({
        ...visitor,
        time_of_visit: visitor.formatted_time_of_visit,
        time_out: visitor.formatted_time_out
      }));
          
    return formattedData;
  } catch (error) {
    console.error('Error fetching visitors:', error);
    throw error;
  }
};

export const updateVisitorTimeOut = async (id: number): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('visits')
      .update({ time_out: now })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error updating time out:', error);
    throw error;
  }
};