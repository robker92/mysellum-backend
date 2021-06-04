export { mockStore1, mockStore2 };

let mockStore1 = {
    _id: '12345',
    userEmail: 'TestEmail1@web.de',
    adminActivation: true,
    deleted: false,
    datetimeCreated: new Date().toISOString(),
    datetimeAdjusted: '',
    profileData: {
        title: 'Store Title 1',
        subtitle: '',
        description: "Example Store's Description 1",
        tags: ['Wine'],
        images: [],
        reviews: [],
        avgRating: '0',
    },
};

let mockStore2 = {
    _id: '123456',
    userEmail: 'TestEmail2@web.de',
    adminActivation: true,
    deleted: false,
    datetimeCreated: new Date().toISOString(),
    datetimeAdjusted: '',
    profileData: {
        title: 'Store Title 2',
        subtitle: '',
        description: "Example Store's Description 2",
        tags: ['Wine'],
        images: [],
        reviews: [],
        avgRating: '0',
    },
};
