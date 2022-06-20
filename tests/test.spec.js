const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/service');

const { postRequest, verify } = require('../src/service');


const payload = [
  {
    FL_ACCOUNT: '123',
    FL_CURRENCY: 'USD',
    FL_AMOUNT: '1000',
  },
];

const data = {
  accountId: '123',
  transactions: [
    {
      id: '001',
      currency: 'USD',
      amount: 1000,
      type: 'Debit',
    },
    {
      id: '001',
      currency: 'USD',
      amount: 1500,
      type: 'Credit',
    },
  ],
  signature:
    'f0jKX7PtzQXBf8DG9fLTje/m701q2DGn67XSeNDgTWIBwB2noLTcy/7RwAT7fFMpKK4bT2JGsjQwdsuKVEWZ/8jSORJud+Ux98rxZa8oBVX1a4/N6ZjrIKMlxJG8haa/yQE1RD0Gxp8OqpT1lhuoC0j0mmq8iOs8q8hQjiWQf3WL0RQvL11Th+fflAuaWhdCsex1/AjTlJ+UV7Y0qneUkt7p0P8S8J8LaxFQsd/AttmuK4zwQt+QDbeTrr8CWgI4HRTlBAPgsucFg6AxwHNC/J9bD/NQC/TcR8+9XmztunWhag3U2FwxN4ThJZhNpqm2xBNbeJNjEhIWmbWRbYHzrrMaFeusxQpL7WoAtqD71Uw5gy4TgP57AOUdyP+kU8G3/hz8l20RJdI6c2AtrNKsv/BUBYpi27CQMF/E2ITBCnDBcNC/M/B675BBa0QshFERIEwPsFWe/d2BjM/dpeomSpwBS44CT1+C69KEyhCKpuqC2207FD8b4y9+7NgyU/ldmFP3inKHrX+JOzyFLTSkDp59UxWFMMQ10OJm734mcLdznLlorYS1iJ2BaakFcN51W4iMozOUohMApUWx+SuYVK3GHWN2biuObRFA6g3d1qID1mPEXj6sdl0KB+JRltSknePDykhSHNw6ftNkZri9j0VCnHR77iFxUy65yO3fgF0=',
};


describe('Test api', () => {
  it('Invalid parameter', async () => {
    const res = await request(app).post('/');
    expect(res.statusCode).toBe(412);
    expect(res.body).toEqual({ code: 412, message: 'INVALID PARAM' });
  });

  it('UnSuccessful response', async () => {
    postRequest.mockImplementation(async() => data);
    verify.mockImplementation(() => false);
    
    const res = await request(app).post('/').send(payload);

    const expectedResponse = [
      {
        FIN_ACCOUNT: '123',
        FIN_CURRENCY: 'USD',
        FIN_DEBIT: 0,
        FIN_CREDIT: 0,
      },
    ];

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedResponse);
  });

  it('Successful response', async () => {
    postRequest.mockImplementation(async() => data);
    verify.mockImplementation(() => true);

    const res = await request(app).post('/').send(payload);

    const expectedResponse = [
      {
        FIN_ACCOUNT: '123',
        FIN_CURRENCY: 'USD',
        FIN_DEBIT: 1500,
        FIN_CREDIT: 1000,
      },
    ];

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedResponse);
  });

  it('Check multiple message', async () => {
    postRequest.mockImplementation(async() => data);
    verify.mockImplementation(() => true);

    const payload2 = [
      {
        FL_ACCOUNT: '123',
        FL_CURRENCY: 'USD',
        FL_AMOUNT: '1000',
      },
      {
        FL_ACCOUNT: '124',
        FL_CURRENCY: 'SGD',
        FL_AMOUNT: '1000',
      },

    ];

    const res = await request(app).post('/').send(payload2);

    const expectedResponse = [
      {
        FIN_ACCOUNT: '123',
        FIN_CURRENCY: 'USD',
        FIN_DEBIT: 1500,
        FIN_CREDIT: 1000,
      },
      {
        FIN_ACCOUNT: '124',
        FIN_CURRENCY: 'SGD',
        FIN_DEBIT: 1500,
        FIN_CREDIT: 1000,
      },

    ];

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedResponse);
  });


});
