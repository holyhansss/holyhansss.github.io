module.exports = {
  title: `holyhansss.github.io`,
  description: `description`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://holyhansss.github.io/`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `holyhansss/holyhansss.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID
  author: {
    name: `한성원`,
    bio: {
      role: ``,
      description: ['새로운 것에 도전하는', '능동적으로 일하는', '배워서 남주는'],
      thumbnail: 'sample.png', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/holyhansss`,
      linkedIn: `https://www.linkedin.com/in/holyhansss/`,
      email: `holyhansss@gmail.com`,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        date: '2021.12~',
        activity: '개인 블로그 운영',
        links: {
          post: '',
          github: 'https://github.com/holyhansss/holyhansss.github.io',
          demo: '',
        },
      },
      {
        date: '2022.1~',
        activity: '수호아이오 Security Researcher',
        links: {
          post: '',
          github: '',
          demo: '',
        },
      },
    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      // {
      //   title: '개발 블로그 테마 개발',
      //   description:
      //     '한동대학교 ICT 창업학부의 Projects관련',
      //   techStack: ['react','firebase'],
      //   thumbnailUrl: 'blog.png',
      //   links: {
      //     post: '/',
      //     github: 'https://github.com/holyhansss',
      //     demo: 'https://github.com/holyhansss',
      //   },
      // },
    ],
  },
};
