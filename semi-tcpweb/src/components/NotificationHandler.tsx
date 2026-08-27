import React, { useEffect } from 'react';
import { Notification } from '@douyinfe/semi-ui';
import { IconComment, IconPhone, IconAlertTriangle } from '@douyinfe/semi-icons';
import { ATResponse, ATService } from '@/services/at';

const NotificationHandler: React.FC = () => {
  useEffect(() => {
    const atService = ATService.getInstance();

    const handleNotification = (response: ATResponse) => {
      if (!('type' in response)) return;

      switch (response.type) {
        case 'incoming_call': {
          if ('number' in response.data && 'time' in response.data && 'state' in response.data) {
            const stateText =
              response.data.state === 'ringing'
                ? '振铃中'
                : response.data.state === 'ended'
                  ? '已挂机'
                  : response.data.state;
            Notification.info({
              title: `来电话啦 - ${stateText}`,
              icon: <IconPhone style={{ color: response.data.state === 'ringing' ? 'var(--semi-color-primary)' : '#10b981' }} />,
              content: (
                <>
                  <div>号码：{response.data.number}</div>
                  <div>时间：{response.data.time}</div>
                </>
              ),
              duration: 0,
              position: 'topRight',
            });
          }
          break;
        }
        case 'new_sms': {
          if ('sender' in response.data && 'content' in response.data && 'time' in response.data) {
            Notification.info({
              title: '来短信啦',
              icon: <IconComment style={{ color: 'var(--semi-color-primary)' }} />,
              content: (
                <>
                  <div>发信人：{response.data.sender}</div>
                  <div>时间：{response.data.time}</div>
                  <div>内容：{response.data.content}</div>
                </>
              ),
              duration: 0,
              position: 'topRight',
            });
          }
          break;
        }
        case 'memory_full': {
          if ('message' in response.data) {
            Notification.warning({
              title: '存储空间警告',
              icon: <IconAlertTriangle style={{ color: '#f59e0b' }} />,
              content: response.data.message,
              duration: 0,
              position: 'topRight',
            });
          }
          break;
        }
        default:
          break;
      }
    };

    atService.subscribe(handleNotification);
    return () => atService.unsubscribe(handleNotification);
  }, []);

  return null;
};

export default NotificationHandler;
