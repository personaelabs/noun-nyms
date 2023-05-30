import { AttestationScheme } from '@personaelabs/nymjs';

export type TestData = {
  title: string;
  body: string;
  replies: TestData[];
  attestationScheme: AttestationScheme;
  upvotes: number;
};

// feat ChatGPT
const testData: TestData[] = [
  {
    title: 'Web3 and Energy Consumption: Is Blockchain Technology Destroying the Environment?',
    body: 'Web3 technology has been criticized for its high energy consumption, with some arguing that blockchain technology is destroying the environment. The debate over Web3 and energy consumption continues to rage on.',
    replies: [
      {
        title: '',
        body: "I think that blockchain technology has the potential to be very environmentally friendly, but it depends on how it's used. For example, some blockchain projects are exploring the use of renewable energy sources to power their networks.",
        replies: [
          {
            title: '',
            body: "That's a great point! I've also heard of blockchain projects using energy-efficient consensus algorithms to reduce energy consumption.",
            replies: [
              {
                title: '',
                body: 'Deeper threading 1',
                replies: [
                  {
                    title: '',
                    body: 'Deeper threading 2',
                    replies: [
                      {
                        title: '',
                        body: 'Deeper threading 3',
                        replies: [
                          {
                            title: '',
                            body: 'Deeper threading 4',
                            replies: [
                              {
                                title: '',
                                body: 'Deeper threading 5',
                                replies: [],
                                attestationScheme: AttestationScheme.EIP712,
                                upvotes: 10,
                              },
                            ],
                            attestationScheme: AttestationScheme.EIP712,
                            upvotes: 10,
                          },
                        ],
                        attestationScheme: AttestationScheme.EIP712,
                        upvotes: 10,
                      },
                    ],
                    attestationScheme: AttestationScheme.EIP712,
                    upvotes: 10,
                  },
                ],
                attestationScheme: AttestationScheme.EIP712,
                upvotes: 10,
              },
            ],
            attestationScheme: AttestationScheme.EIP712,
            upvotes: 10,
          },

          {
            title: '',
            body: 'Interesting! Do you have any examples of blockchain projects using renewable energy sources?',
            replies: [],
            attestationScheme: AttestationScheme.EIP712,
            upvotes: 1,
          },
        ],
        attestationScheme: AttestationScheme.EIP712,
        upvotes: 1,
      },
      {
        title: '',
        body: "I agree that energy consumption is a concern with blockchain technology, but it's not the only consideration. There are also issues of scalability, security, and governance that need to be addressed.",
        replies: [
          {
            title: '',
            body: 'Absolutely! I think that scalability is a particularly important challenge to overcome if blockchain technology is going to become more widely adopted.',
            replies: [],
            attestationScheme: AttestationScheme.EIP712,
            upvotes: 1,
          },
          {
            title: '',
            body: 'Good point about security and governance. How can we ensure that blockchain networks are secure and decentralized?',
            replies: [],
            attestationScheme: AttestationScheme.Nym,
            upvotes: 1,
          },
        ],
        attestationScheme: AttestationScheme.Nym,
        upvotes: 1,
      },
    ],
    attestationScheme: AttestationScheme.EIP712,
    upvotes: 1,
  },
];

export default testData;
