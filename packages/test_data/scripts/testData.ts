export type TestData = {
  title: string;
  body: string;
  replies: TestData[];
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
            replies: [],
          },
          {
            title: '',
            body: 'Interesting! Do you have any examples of blockchain projects using renewable energy sources?',
            replies: [],
          },
        ],
      },
      {
        title: '',
        body: "I agree that energy consumption is a concern with blockchain technology, but it's not the only consideration. There are also issues of scalability, security, and governance that need to be addressed.",
        replies: [
          {
            title: '',
            body: 'Absolutely! I think that scalability is a particularly important challenge to overcome if blockchain technology is going to become more widely adopted.',
            replies: [],
          },
          {
            title: '',
            body: 'Good point about security and governance. How can we ensure that blockchain networks are secure and decentralized?',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    title: 'The Importance of Community in Achieving Shared Goals',
    body: 'Communities are critical for achieving shared goals and creating positive change. How can we build and foster strong communities, and what are the benefits of doing so?',
    replies: [
      {
        title: '',
        body: "I think that communication is key to building strong communities. It's important to listen to each other and be open to different perspectives.",
        replies: [
          {
            title: '',
            body: 'Definitely! Active listening and respectful communication are essential for creating a positive and inclusive community.',
            replies: [],
          },
          {
            title: '',
            body: 'What do you think are some common communication barriers that can prevent effective community building?',
            replies: [],
          },
        ],
      },
      {
        title: '',
        body: 'Building trust is also important for fostering strong communities. When people trust each other, they are more likely to work together and achieve their goals.',
        replies: [
          {
            title: '',
            body: "I completely agree! Trust is the foundation of any healthy relationship, and it's especially important in a community context.",
            replies: [],
          },
          {
            title: '',
            body: 'How do you think trust can be built in a community setting, especially if there are people from different backgrounds and cultures involved?',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    title: 'Community and Collaboration: Best Practices for Working Together',
    body: 'Collaboration is critical for the success of any community, but it can also be a challenge. What are the best practices for working together in community settings, and how can we ensure that everyone has a voice?',
    replies: [
      {
        title: '',
        body: "I think that having clear goals and expectations is important for successful collaboration. When everyone knows what they're working towards, it's easier to stay on track and avoid conflicts.",
        replies: [
          {
            title: '',
            body: 'Yes, setting clear expectations from the outset can help avoid misunderstandings and ensure that everyone is on the same page.',
            replies: [],
          },
          {
            title: '',
            body: 'Do you have any tips for setting effective goals in a collaborative setting?',
            replies: [],
          },
        ],
      },
      {
        title: '',
        body: "It's also important to have a diverse group of people involved in the collaboration.",
        replies: [],
      },
    ],
  },
  {
    title: "What's your favorite book?",
    body: "I'm always looking for new book recommendations! What's your all-time favorite book and why? I'm currently reading \"To Kill a Mockingbird\" and loving it.",
    replies: [
      {
        title: '',
        body: 'I love "To Kill a Mockingbird"! It\'s such a powerful story with great characters. Have you read "The Great Gatsby"? It\'s another one of my favorites.',
        replies: [],
      },
      {
        title: '',
        body: 'I haven\'t read "The Great Gatsby" yet, but it\'s on my list! Thanks for the recommendation.',
        replies: [],
      },
      {
        title: '',
        body: 'I haven\'t read "The Great Gatsby" yet, but it\'s on my list! Thanks for the recommendation.',
        replies: [],
      },
    ],
  },
  {
    title: 'Best budget travel destinations',
    body: "What are some great budget-friendly travel destinations you've visited? Share your tips for traveling on a budget!",
    replies: [
      {
        title: '',
        body: 'I recently visited Bali on a budget and it was amazing! There are plenty of affordable accommodations and food options, and the scenery is breathtaking.',
        replies: [],
      },
      {
        title: '',
        body: 'I highly recommend Portugal as a budget travel destination. The food, wine, and beaches are incredible, and there are many budget-friendly options for accommodations and activities.',
        replies: [],
      },
    ],
  },
  {
    title: 'Favorite hiking trails',
    body: "What's your favorite hiking trail and why? I love exploring new trails and would love to hear about some of your favorites!",
    replies: [
      {
        title: '',
        body: 'My favorite hiking trail is the West Coast Trail in British Columbia, Canada. The scenery is stunning, and the challenging terrain makes for a rewarding experience.',
        replies: [],
      },
      {
        title: '',
        body: 'I love hiking the Appalachian Trail in the US. The trail offers a variety of terrains and stunning vistas, and the hiking community is very welcoming.',
        replies: [],
      },
    ],
  },
  {
    title: 'Tips for stress management',
    body: "Stress can be overwhelming at times. What are some of your favorite stress management techniques? Let's share tips and tricks to help each other stay calm and focused.",
    replies: [
      {
        title: '',
        body: 'I find that taking a walk in nature helps me de-stress and clear my mind. It also helps to disconnect from technology for a while.',
        replies: [],
      },
      {
        title: '',
        body: 'Yoga and meditation have been my go-to stress management techniques for years. They help me stay centered and focused, even during challenging times.',
        replies: [
          {
            title: '',
            body: 'I agree, yoga and meditation are great for stress management. I also find that journaling helps me process my thoughts and emotions.',
            replies: [],
          },
          {
            title: '',
            body: 'I agree, yoga and meditation are great for stress management. I also find that journaling helps me process my thoughts and emotions.',
            replies: [],
          },
          {
            title: '',
            body: 'I agree, yoga and meditation are great for stress management. I also find that journaling helps me process my thoughts and emotions.',
            replies: [],
          },
        ],
      },
    ],
  },

  {
    title: 'Favorite local restaurants',
    body: "What are your favorite local restaurants and why? I'm always on the hunt for new places to try and would love to hear about some hidden gems!",
    replies: [],
  },
  {
    title: 'How to stay motivated',
    body: "Staying motivated can be tough, especially when working towards long-term goals. What are some strategies you use to stay motivated and focused? Let's share tips and inspire each other to keep pushing forward!",
    replies: [],
  },
  {
    title: 'Favorite podcasts',
    body: "What are some of your favorite podcasts and why? I'm always looking for new shows to listen to during my commute, and would love to hear about some must-listens!",
    replies: [],
  },
  {
    title: 'Tips for time management',
    body: "Time management can be challenging, especially when balancing work, school, and personal life. What are some tips and tricks you use to stay organized and make the most of your time? Let's share our best practices!",
    replies: [],
  },
  {
    title: 'How to deal with anxiety',
    body: "Anxiety can be a difficult emotion to manage. What are some techniques you use to cope with anxiety? Let's share our strategies and support each other through tough times.",
    replies: [],
  },
  {
    title: 'Favorite workout routines',
    body: "What are your favorite workout routines and why? Whether it's running, yoga, or weightlifting, share your go-to workouts and inspire others to try something new!",
    replies: [],
  },
  {
    title: 'Tips for healthy eating',
    body: "Healthy eating is essential for maintaining a balanced lifestyle. What are some tips and tricks you use to make healthy choices and stay on track? Let's share our favorite recipes and strategies for eating well!",
    replies: [],
  },
  {
    title: 'Favorite travel memories',
    body: "What are some of your favorite travel memories and why? Whether it's a beautiful sunset or an unforgettable adventure, let's share our favorite moments",
    replies: [],
  },
  {
    title: "What's the best way to learn a new language?",
    body: "I'm interested in learning a new language, but I'm not sure where to start. What methods have worked best for you? Any tips or advice would be greatly appreciated!",
    replies: [],
  },
  {
    title: 'Favorite TV Shows of All Time',
    body: "Let's share our favorite TV shows of all time! What are some shows that you could watch over and over again? What makes them so great?",
    replies: [],
  },
  {
    title: 'How to Stay Motivated When Working From Home',
    body: 'Working from home can be a challenge, especially when it comes to staying motivated. What are some tips or tricks that have helped you stay productive and focused?',
    replies: [],
  },
  {
    title: "What's Your Favorite Book and Why?",
    body: "Let's discuss our favorite books and what makes them so great! What's a book that you could read over and over again and never get tired of?",
    replies: [],
  },
  {
    title: 'The Best Places to Travel Solo',
    body: "I'm planning a solo trip and I'm looking for recommendations on the best places to travel alone. Any suggestions or tips for traveling solo would be greatly appreciated!",
    replies: [],
  },
  {
    title: "How to Overcome Writer's Block",
    body: "As a writer, I often struggle with writer's block. What are some strategies or techniques that have helped you overcome writer's block and get back to writing?",
    replies: [],
  },
  {
    title: 'The Benefits of Meditation',
    body: "Meditation has many benefits, from reducing stress and anxiety to improving focus and concentration. Let's discuss the different types of meditation and how they can help improve our mental health.",
    replies: [],
  },
  {
    title: 'Introducing our DAO: What We Stand For',
    body: 'Our DAO is dedicated to promoting decentralized decision-making, transparency, and community ownership. In this post, we outline our core values and goals, and explain how we plan to achieve them.',
    replies: [],
  },
  {
    title: 'DAO Governance: How We Make Decisions',
    body: 'As a DAO, we rely on decentralized decision-making to ensure that all members have a voice and a vote. In this post, we explain our governance structure and how we reach consensus on important issues.',
    replies: [],
  },
  {
    title: 'Building our DAO Community: Strategies and Best Practices',
    body: 'A strong and engaged community is essential for the success of our DAO. In this post, we share strategies and best practices for building and maintaining an active and supportive community.',
    replies: [],
  },
  {
    title: 'DAO Treasury Management: How We Handle Funds',
    body: 'As a DAO, we rely on our treasury to fund initiatives and projects that align with our mission. In this post, we explain our approach to treasury management and how we prioritize and allocate funds.',
    replies: [],
  },
  {
    title: 'DAO Tokenomics: How Our Token Works',
    body: 'Our DAO token plays a critical role in our governance and decision-making processes. In this post, we explain how our tokenomics work and how token holders can participate in DAO governance.',
    replies: [],
  },
  {
    title: 'DAO Roadmap: Our Plans for the Future',
    body: 'In this post, we outline our roadmap and plans for the future of our DAO. We discuss upcoming initiatives, partnerships, and community events, and share our vision for the long-term success of our organization.',
    replies: [],
  },
  {
    title: 'DAO Case Study: Lessons Learned from a Failed Proposal',
    body: 'Not every proposal is successful, and sometimes even the most well-intentioned ideas fail to gain traction. In this post, we reflect on a failed proposal and share lessons learned for improving our decision-making processes.',
    replies: [],
  },
  {
    title: 'DAO Marketing: Strategies and Best Practices',
    body: 'Marketing is critical for building awareness and growing our DAO community. In this post, we share marketing strategies and best practices for promoting our DAO and reaching new audiences.',
    replies: [],
  },
  {
    title: 'DAO Security: How We Protect Against Attacks',
    body: 'As a decentralized organization, we must be vigilant against potential security threats and attacks. In this post, we discuss our security measures and best practices for protecting our organization and our members.',
    replies: [],
  },
  {
    title: 'DAO Partnerships: Building Stronger Communities',
    body: 'Partnerships with other DAOs and blockchain organizations can help us achieve our goals and build a stronger community. In this post, we discuss our approach to partnerships and share examples of successful collaborations.',
    replies: [],
  },
  {
    title: 'DAO Legal Compliance: Navigating Regulatory Challenges',
    body: 'Navigating the complex legal landscape of decentralized organizations can be challenging. In this post, we discuss our approach to legal compliance and share best practices for staying compliant with regulatory requirements.',
    replies: [],
  },
  {
    title: 'Web3: The End of Privacy or A New Era of Freedom?',
    body: 'As Web3 technology continues to evolve, questions about privacy and data ownership become more critical. Some argue that Web3 is the end of privacy as we know it, while others see it as a new era of freedom and self-sovereignty.',
    replies: [],
  },
  {
    title: 'Decentralization vs. Centralization: Which is Better for Web3?',
    body: 'Web3 technology is founded on the principles of decentralization, but some argue that centralization is necessary for scalability and security. The debate between decentralization and centralization in Web3 continues to rage on.',
    replies: [],
  },
  {
    title: 'Web3 and Governance: Can Decentralization Lead to Anarchy?',
    body: 'Web3 governance is a contentious issue, with some arguing that decentralization can lead to anarchy and chaos. Others argue that it is the only way to ensure fair and transparent decision-making in a trustless environment.',
    replies: [],
  },
  {
    title: 'Web3 Tokens: The Future of Finance or A Bubble Waiting to Burst?',
    body: "Web3 tokens have revolutionized the way we think about finance, but some argue that it's a bubble waiting to burst. The debate over the future of Web3 tokens continues to divide the community.",
    replies: [],
  },
  {
    title: 'Web3 Interoperability: The Key to Mass Adoption or The Death of Decentralization?',
    body: "Web3 interoperability is a critical challenge for the blockchain industry, with some arguing that it's the key to mass adoption and others seeing it as the death of decentralization. The debate over Web3 interoperability rages on.",
    replies: [],
  },
  {
    title: 'Web3 and Privacy: Can We Really Trust Decentralized Networks?',
    body: 'Web3 networks promise greater privacy and security, but can we really trust decentralized networks? The debate over Web3 and privacy continues to be a contentious issue.',
    replies: [],
  },
  {
    title: 'Web3 Scalability: Can We Scale Decentralized Networks Without Sacrificing Security?',
    body: "Web3 scalability is a major challenge for the blockchain industry, with some arguing that we can't scale decentralized networks without sacrificing security. The debate over Web3 scalability continues to divide the community.",
    replies: [],
  },
  {
    title: 'Web3 and Regulation: Can Decentralization Coexist with Regulation?',
    body: 'As Web3 technology continues to evolve, questions about regulation and compliance become more critical. Some argue that decentralization and regulation cannot coexist, while others see regulation as necessary for the mainstream adoption of Web3 technology.',
    replies: [],
  },
  {
    title: 'Web3 Identity: The Future of Self-Sovereign Identity or A New Era of Surveillance?',
    body: "Web3 identity promises greater self-sovereignty and security, but some argue that it's a new era of surveillance. The debate over Web3 identity continues to be a controversial issue.",
    replies: [],
  },
  {
    title: 'Community and Diversity: Why Diversity Matters and How to Promote It',
    body: 'Diversity is critical for creating inclusive and welcoming communities, but it can also be a challenge. Why does diversity matter, and what are the best practices for promoting diversity in communities?',
    replies: [],
  },
  {
    title: 'Community and Inclusivity: How to Ensure Everyone Feels Welcome',
    body: 'Inclusivity is critical for creating welcoming and supportive communities, but it can be a challenge to achieve. What are the best practices for ensuring that everyone feels welcome in community settings?',
    replies: [],
  },
  {
    title: 'Community and Networking: How to Build Connections and Expand Your Reach',
    body: 'Networking is critical for the success of any community, but it can also be a challenge. What are the best practices for building connections and expanding your reach in community settings?',
    replies: [],
  },
  {
    title: 'Community and Volunteerism: Best Practices for Encouraging and Supporting Volunteerism',
    body: 'Volunteerism is critical for the success of many communities, but it can be a challenge to encourage and support. What are the best practices for encouraging and supporting volunteerism in community settings?',
    replies: [],
  },
  {
    title: 'Community and Empowerment: How to Empower Members to Take Action',
    body: 'Empowering members to take action is critical for achieving shared goals in community settings. What are the best practices for empowering members, and how can we ensure that everyone has a voice?',
    replies: [],
  },
  {
    title: 'Community and Education: How to Foster Lifelong Learning and Development',
    body: 'Fostering lifelong learning and development is critical for the success of any community, but it can be a challenge. What are the best practices for promoting education and development in community settings?',
    replies: [],
  },
  {
    title: 'Community and Wellness: Best Practices for Supporting Mental and Physical Health',
    body: 'Supporting mental and physical health is critical for the well-being of community members. What are the best practices for promoting wellness in community settings, and how can we ensure that everyone has access to resources and support?',
    replies: [],
  },
  {
    title: 'Community and Leadership: Best Practices for Developing Effective Leaders',
    body: 'Developing effective leaders is critical for the success of any community, but it can be a challenge. What are the best practices for developing and supporting effective leaders in community settings?',
    replies: [],
  },
  {
    title: 'Community and Innovation: How to Foster Creativity and Innovation',
    body: 'Fostering creativity and innovation is critical for the long-term success of any community. What are the best practices for promoting innovation in community settings, and how can we ensure that everyone has a voice?',
    replies: [],
  },
];

export default testData;
