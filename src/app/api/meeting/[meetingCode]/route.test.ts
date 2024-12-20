import { describe, it, expect, vi } from 'vitest';
import * as handler from './route';

describe('Meeting Route', () => {


    it('should return meeting details for a valid meeting code', async () => {
        vi.mock('./findMeeting', () => ({
            findMeeting: async function() {
                return {
                    scheduledEndTime: 'foo',
                    code: "foo",
                    name: "foo",
                    uri: "foo",
                    userId: "foo"
                }
            }
        }));
        vi.mock('./../../../../session-store', () => ({
            getSessionKey: async function() {
                return 'foo'
            }
        }));
        const response = await handler.GET(null as any, {params: Promise.resolve({meetingCode: "validMeeting"})});
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toHaveProperty('uri', 'foo');
    });

    it.skip('should return 404 for an invalid meeting code', async () => {
        const response = await fetch('/api/meeting/invalidMeetingCode');
        expect(response.status).toBe(404);
    });
});