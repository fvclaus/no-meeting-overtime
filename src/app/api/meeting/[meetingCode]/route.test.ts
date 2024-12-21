import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as handler from './route';
import {findMeeting} from './findMeeting';
import { getSessionKey } from '@/session-store';


describe('/api/meeting/[meetingCode]', () => {

    beforeEach(() => {
        vi.mock('./findMeeting');
        vi.mock('./../../../../session-store');
        vi.resetAllMocks();
        const findMeetingMock: typeof findMeeting = async (params) => {
            const meetingCode = (await params).meetingCode;
            return {
                code: meetingCode,
                uri: meetingCode,
                userId: `${meetingCode}_userId`,
                name: 'name',
                scheduledEndTime: 'scheduledEndTime'
            }
        }
        vi.mocked(findMeeting).mockImplementation(findMeetingMock)
    })

    describe('GET', () => {
        it('should return meeting details for a valid meeting code', async () => {
            vi.mocked(getSessionKey).mockResolvedValue('validMeeting_userId');
            const response = await handler.GET(null as any, {params: Promise.resolve({meetingCode: "validMeeting"})});
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({uri: 'validMeeting', scheduledEndTime: 'scheduledEndTime'});
        });
    
        it('should return 403 for an invalid meeting code', async () => {
            vi.mocked(findMeeting).mockResolvedValue(undefined);
            const response = await handler.GET(null as any, {params: Promise.resolve({meetingCode: "invalidMeeting"})});
            expect(vi.mocked(getSessionKey)).toHaveBeenCalledTimes(0);
            expect(response.status).toBe(403);
        });
    
        it('should return 403 for a meeting code that belongs to other person', async () => {
            vi.mocked(getSessionKey).mockResolvedValue('otherUser');
            const response = await handler.GET(null as any, {params: Promise.resolve({meetingCode: "validMeeting"})});
            expect(vi.mocked(getSessionKey)).toHaveBeenCalledOnce();
            expect(response.status).toBe(403);
        });
    })


});