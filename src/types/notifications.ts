//for notif page

export interface Notification {
  id: string;
  type: 'affiliation_request' | 'message_reply' | 'booking';
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}

