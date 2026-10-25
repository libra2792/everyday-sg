/**
 * Content for the "Who made this" page (/creator).
 *
 * Everything on that page is plain text here so it can be edited without touching the
 * page layout. Photos live in /public/creator. Keep captions accurate to the photos.
 */

export interface CreatorPhoto {
  src: string;
  alt: string;
  caption: string;
  /** Portrait photos are shown in a 3:4 frame, landscape in 16:10, square in 1:1. */
  shape: 'portrait' | 'landscape' | 'square';
}

export interface CreatorSection {
  id: string;
  icon: string;
  title: string;
  paragraphs: string[];
  photos?: CreatorPhoto[];
  /** Which side the photos sit on at desktop width. */
  photoSide?: 'left' | 'right';
}

export const CREATOR = {
  name: 'Nigel',
  eyebrow: 'Who made this',
  title: 'Hi, I’m Nigel. I’m figuring this out too.',
  lead: 'Everyday SG is not built by a bank, an agency or a content farm. It is built by an ordinary Singaporean trying to get through the same high-pressure cauldron as you: CPF rules, housing queues, insurance jargon, ageing parents and a newborn, while holding down a job and a life.',
  heroPhoto: {
    src: '/creator/stadium.jpg',
    alt: 'Nigel and his wife taking a selfie in the stands of a stadium before a football match.',
    caption: 'My wife and me at a match at the National Stadium.',
    shape: 'landscape',
  } satisfies CreatorPhoto,
  sections: [
    {
      id: 'newborn',
      icon: 'sprout',
      title: 'It started with a newborn',
      paragraphs: [
        'Not long ago my wife and I welcomed our daughter. Nobody warns you about the admin that arrives with her.',
        'Between night feeds I was registering a birth, sorting out leave, opening accounts, chasing insurance and working out childcare, each with its own portal, its own rules and its own deadline. I kept thinking: why is there no single place that tells me, in plain English, what to do next and roughly what it costs?',
        'That question became this site. The baby calculator and the parenting guides are the ones I needed first.',
      ],
      photos: [
        {
          src: '/creator/wedding.jpg',
          alt: 'Nigel in a light suit walking hand in hand with his wife in a white dress across a garden lawn on their wedding day.',
          caption: 'Where it all started: our wedding day.',
          shape: 'portrait',
        },
      ],
      photoSide: 'right',
    },
    {
      id: 'sandwiched',
      icon: 'heart-handshake',
      title: 'Sandwiched in the middle',
      paragraphs: [
        'At the same time, I am supporting my parents in their retirement. They worked for decades so that my sister and I could have more than they did. They are not as financially savvy as they would need to be to navigate all of it alone.',
        'So I am the one checking that their CPF nominations are made, that their insurance is still in force, that there is a will and a Lasting Power of Attorney, and that someone knows where the documents are. Not because I expect the worst, but because if something happens unexpectedly, I do not want them, or me, untangling it in the middle of a crisis.',
        'If you are the “responsible one” in your family, you know this feeling. It is love, with a checklist attached. The caregiving and legal guides come from it.',
      ],
      photos: [
        {
          src: '/creator/parents-travel.jpg',
          alt: 'Nigel, his wife and his parents standing together on a bridge over a canal on a bright day.',
          caption: 'Travelling with my parents and my wife.',
          shape: 'portrait',
        },
        {
          src: '/creator/graduation.jpg',
          alt: 'Nigel in a graduation gown holding a bouquet, standing on a staircase between his mother and father.',
          caption: 'Graduation day, with the two people who got me there.',
          shape: 'portrait',
        },
      ],
      photoSide: 'left',
    },
    {
      id: 'sister',
      icon: 'feather',
      title: 'Losing my sister',
      paragraphs: [
        'In 2025 my sister passed away from cancer. I was the executor of her estate.',
        'Grieving while dealing with banks, CPF, insurers, bills and paperwork taught me how much easier things are when they are in order, and how much harder they are when they are not. Every form asked for something I had to go looking for.',
        'Many of the checklists here, the will, the CPF nomination, the LPA, the “where everything is” document, come straight from that experience. I would rather you do them on a quiet Sunday than in a hospital corridor.',
      ],
      photos: [
        {
          src: '/creator/family-hospital.jpg',
          alt: 'Nigel’s sister sitting up in a hospital bed, smiling, with Nigel, his wife, his parents and family gathered around her and a cake on the table.',
          caption: 'My sister, with all of us around her.',
          shape: 'portrait',
        },
      ],
      photoSide: 'right',
    },
    {
      id: 'home',
      icon: 'home',
      title: 'A home of our own',
      paragraphs: [
        'Like many couples here, my wife and I bought a home before we could live in it. The deposit, the stamp duty, the loan and everything that follows: the financial weight of buying a home in Singapore is real, and it arrives all at once.',
        'Right now we rent while we wait a few more years for our place to be completed. Renting while we wait is an extra cost, but it means we are building our own family unit instead of staying under my parents’ roof indefinitely. It also means doing the sums more carefully than I ever have.',
        'The housing calculator is the one I built for myself first.',
      ],
      photos: [
        {
          src: '/creator/hike.jpg',
          alt: 'Nigel and his wife holding hands while hiking up a dirt trail, with a lake, a town and mountains far below.',
          caption: 'The long walk up, together.',
          shape: 'portrait',
        },
      ],
      photoSide: 'left',
    },
  ] satisfies CreatorSection[],
  promises: [
    { icon: 'shield-check', title: 'Independent', text: 'No agency, bank or insurer is behind this site, and nobody pays to be featured.' },
    { icon: 'lock-keyhole', title: 'Private', text: 'Nothing you type leaves your browser. No accounts, no tracking, no servers.' },
    { icon: 'badge-check', title: 'Honest about numbers', text: 'Figures are labelled as official statistics or planning guides, with the date they were checked, and links go to the agency itself.' },
    { icon: 'compass', title: 'Not advice', text: 'This is general information, not financial, legal or tax advice. Use it to prepare, then confirm with the agency or a licensed professional.' },
  ],
  closing: 'If this site saves you one evening of confusion, it has done its job. Share it with one person who needs it.',
  credit: 'Made in Singapore by Nigel. The photos are my own. Built with React, TypeScript and Tailwind CSS; icons by Lucide.',
};
