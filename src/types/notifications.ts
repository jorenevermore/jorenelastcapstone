//for notif page

export interface Notification {
  id: string;
  type: 'affiliation_request'| 'booking';
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}

