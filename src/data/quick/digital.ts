import type { GuideExtras } from '../types';
import { guide, official, tool } from '@/lib/quick';

export const DIGITAL_EXTRAS: Record<string, GuideExtras> = {
  'scam-protection': {
    quick: {
      intro: 'Describe the message or call you received. The pattern tells you more than the sender’s name.',
      fields: [
        { id: 'via', label: 'It came as', type: 'choice', options: [{ value: 'call', label: 'A call claiming to be a bank, government or police' }, { value: 'invest', label: 'An investment or crypto opportunity' }, { value: 'shop', label: 'An online purchase, delivery or job offer' }, { value: 'friend', label: 'A friend or family member asking for money' }], default: 'call' },
        { id: 'asks', label: 'It asks for', type: 'choice', options: [{ value: 'otp', label: 'An OTP, PIN, password or Singpass login' }, { value: 'money', label: 'A transfer, deposit or gift card' }, { value: 'details', label: 'Personal or card details' }, { value: 'none', label: 'Nothing yet' }], default: 'otp' },
        { id: 'pressure', label: 'Urgency or secrecy', type: 'choice', options: [{ value: 'yes', label: 'Yes: act now, tell no one' }, { value: 'no', label: 'No' }], default: 'yes' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        let risk = 0;
        if (a.asks === 'otp') {
          risk += 3;
          why.push('No bank, government agency or the police will ever ask for an OTP, PIN, password or Singpass login. The request itself is the scam.');
        }
        if (a.asks === 'money') {
          risk += 2;
          why.push('Transfers to "safety accounts", deposits to unlock winnings or payments in gift cards are scam signatures.');
        }
        if (a.asks === 'details') {
          risk += 1;
          why.push('Card numbers, NRIC and addresses are used for the next, more convincing contact. Give nothing over an inbound call or link.');
        }
        if (a.pressure === 'yes') {
          risk += 2;
          why.push('Urgency and secrecy exist to stop you checking. The check is the defence: hang up and call the official number from the organisation’s own website or the back of your card.');
        }
        if (a.via === 'invest') why.push('Guaranteed returns, celebrity endorsements and pressure to top up are the pattern; check MAS’s Investor Alert List before sending anything.');
        if (a.via === 'friend') why.push('Call the person on a number you already have; account takeovers and voice cloning make the message look and sound real.');
        if (a.via === 'shop') why.push('Pay only on the platform; "pay a fee to release the parcel or the job" is a scam.');
        return {
          label: 'Direction',
          verdict: risk >= 3 ? 'Stop. Do not reply, pay or share anything' : risk >= 1 ? 'Verify before doing anything' : 'Low signs so far; stay alert',
          why,
          next: [official('scamshield-check', 'Check a number, link or message on ScamShield.'), official('scamshield-report', 'Report it, and call the ScamShield helpline if money has moved.'), guide('account-security', 'Lock the accounts the scammer would go for next.')],
          fine: 'Pattern-based pointers; if money has already moved, call your bank immediately to freeze accounts, then report.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Unexpected call, message or offer',
      question: 'Asks for money, an OTP, a login, or urgency?',
      yes: 'Stop. Hang up. Do not click or pay.',
      no: 'Still verify through the official channel',
      yesThen: 'Call the organisation on its own published number',
      noThen: 'Check the sender on ScamShield',
      caption: 'One rule covers most scams: anything unexpected that wants money, codes or speed gets checked through a channel you chose, not the one they gave.',
      aria: 'Flowchart: if an unexpected contact asks for money, codes or urgency, stop and verify through official channels; otherwise still verify.',
    },
  },

  'account-security': {
    quick: {
      intro: 'Four yes-or-no answers score how exposed your main accounts are and what to fix first.',
      fields: [
        { id: 'reuse', label: 'Same password on several sites', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'yes' },
        { id: 'twofa', label: 'Two-factor on email and bank', type: 'choice', options: [{ value: 'yes', label: 'On' }, { value: 'no', label: 'Off or not sure' }], default: 'no' },
        { id: 'singpass', label: 'Singpass app with face verification', type: 'choice', options: [{ value: 'yes', label: 'Set up' }, { value: 'no', label: 'No' }], default: 'no' },
        { id: 'manager', label: 'Password manager', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        let score = 0;
        if (a.reuse === 'yes') why.push('One leaked site exposes every account that shares the password. Change the email and bank passwords first; they are the keys to everything else.');
        else score += 1;
        if (a.twofa === 'no') why.push('Two-factor on your email and banking apps blocks most takeovers even when a password leaks. Use an app or hardware key over SMS where offered.');
        else score += 1;
        if (a.singpass === 'no') why.push('The Singpass app with face verification is both safer and the only way to use some services; set it up and turn on login notifications.');
        else score += 1;
        if (a.manager === 'no') why.push('A password manager makes unique passwords practical; without one, reuse creeps back.');
        else score += 1;
        if (score === 4) why.push('All four in place. Add a yearly check of recovery emails and phone numbers, and review which apps have access to your accounts.');
        return {
          label: 'Pointer',
          verdict: score === 4 ? 'Well protected' : score >= 2 ? `${4 - score} fixes to make` : 'Exposed: start with email and bank',
          stats: [{ label: 'Protections in place', value: `${score} of 4` }],
          why,
          next: [official('singpass', 'Set up the Singpass app and security settings.'), guide('scam-protection', 'How accounts actually get taken over.'), tool('annual-admin', 'Put the yearly security check on the list.')],
          fine: 'General security practice; each bank and service has its own settings.',
        };
      },
    },
    figure: {
      type: 'compare',
      options: ['Password only', 'Unique passwords + 2FA + manager'],
      rows: [
        { label: 'Protection if a site leaks', a: 0, b: 3 },
        { label: 'Protection against phishing', a: 1, b: 2, note: 'App-based 2FA and passkeys resist it best' },
        { label: 'Effort to set up', a: 3, b: 1, note: 'An afternoon, once' },
        { label: 'Recovery when locked out', a: 1, b: 3, note: 'Backup codes and recovery contacts' },
      ],
      caption: 'The second column costs an afternoon and removes most of the ways accounts are taken over.',
      aria: 'Comparison of password-only accounts with unique passwords, two-factor and a manager.',
    },
  },

  'document-renewals': {
    quick: {
      intro: 'Expiry dates hide in drawers. Three answers find the ones that bite soonest.',
      fields: [
        { id: 'passport', label: 'Passport validity', type: 'choice', options: [{ value: 'long', label: 'More than a year left' }, { value: 'short', label: 'Less than a year' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
        { id: 'travel', label: 'Travel planned in the next 6 months', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'other', label: 'Also expiring or renewing this year', type: 'choice', options: [{ value: 'none', label: 'Nothing I know of' }, { value: 'tenancy', label: 'Tenancy or lease' }, { value: 'insurance', label: 'Insurance or road tax' }, { value: 'work', label: 'Work pass or licence' }], default: 'none' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.passport !== 'long' && a.travel === 'yes') why.push('Many countries refuse entry with less than six months’ validity. Renew the passport before booking; ICA renewals are made online and usually take a couple of weeks.');
        else if (a.passport === 'unsure') why.push('Check the passport’s expiry today and write it in your renewals list with a reminder nine months before.');
        if (a.other === 'tenancy') why.push('Tenancies need notice before expiry to renew or leave; the agreement sets the notice period, often one to two months.');
        if (a.other === 'insurance') why.push('Lapsed motor insurance or road tax is an offence; most renew automatically only if payment details are current.');
        if (a.other === 'work') why.push('Work passes and licences often need action weeks before expiry; start when the renewal window opens.');
        why.push('Keep one list with every document, its expiry and where it is kept; review it once a year with the annual life-admin checklist.');
        return {
          label: 'Pointer',
          verdict: a.passport !== 'long' && a.travel === 'yes' ? 'Renew the passport first' : a.other !== 'none' ? 'One renewal to diarise' : 'Build the renewals list',
          why,
          next: [official('ica-passport', 'Renew a Singapore passport online.'), tool('annual-admin', 'The yearly list, with a documents section.'), guide('annual-life-admin', 'The rest of the yearly review.')],
          fine: 'General guidance; each document’s issuer sets its renewal rules.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'A document or contract',
      question: 'Expiry date known and written down?',
      yes: 'Reminder set 3 months before',
      no: 'Find it today; add it to the renewals list',
      yesThen: 'Renew in the issuer’s window',
      noThen: 'Passports: 9 months before, for travel',
      caption: 'Renewals go wrong for one reason: nobody knew the date. The list is the whole system.',
      aria: 'Flowchart: if a document’s expiry is recorded, set a reminder three months before; if not, find it and add it to the list.',
    },
  },
};
