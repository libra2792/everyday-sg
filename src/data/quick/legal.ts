import type { GuideExtras } from '../types';
import { guide, official, tool } from '@/lib/quick';

export const LEGAL_EXTRAS: Record<string, GuideExtras> = {
  'make-a-will': {
    quick: {
      intro: 'Five yes-or-no answers say how urgent a will is for you and what should go in it.',
      fields: [
        { id: 'have', label: 'Do you have a will?', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'old', label: 'Yes, but things have changed' }, { value: 'yes', label: 'Yes, current' }], default: 'no' },
        { id: 'married', label: 'Married', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'kids', label: 'Children under 21', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'muslim', label: 'Muslim', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'exec', label: 'Executor chosen and asked', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.muslim === 'yes') why.push('For Muslims, the estate is distributed under faraid through the Syariah Court; a will (wasiat) can cover up to a third of the estate to non-heirs. Take advice from a lawyer familiar with both.');
        if (a.have === 'no') {
          why.push(a.married === 'yes' && a.kids === 'yes' ? 'Without a will, the Intestate Succession Act gives your spouse half and your children the other half; if both parents die, a court decides who looks after the children.' : a.married === 'yes' ? 'Without a will and without children, your spouse shares the estate with your parents under the Intestate Succession Act.' : 'Without a will the Intestate Succession Act fixes who inherits, in an order you may not intend.');
        }
        if (a.have === 'old') why.push('A will is revoked by marriage and stays valid through divorce; if either happened, or an executor or beneficiary has died, make a new one rather than amending the old.');
        if (a.kids === 'yes') why.push('Name a guardian and a trustee for the children’s share; without a will, the court appoints both.');
        if (a.exec === 'no') why.push('Choose an executor who is organised and willing, and ask them. The role involves months of paperwork; a reluctant executor slows everything.');
        if (a.have === 'yes' && a.exec === 'yes') why.push('Keep the original somewhere the executor can reach without you, and tell them where. Review it after every life event.');
        return {
          label: 'Direction',
          verdict: a.have === 'yes' ? 'Keep it current and findable' : a.have === 'old' ? 'Make a new will' : a.kids === 'yes' ? 'Make a will now: your children need a named guardian' : 'Make a will',
          why,
          next: [official('mylegacy', 'Wills, nominations and the Legacy Planning steps on My Legacy.'), guide('lasting-power-of-attorney', 'The document for while you are alive but cannot decide.'), tool('annual-admin', 'Add the yearly review.')],
          fine: 'General rules under Singapore law; a lawyer or the Public Trustee’s guidance covers your specifics. This is not legal advice.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'You die',
      question: 'Is there a valid will?',
      yes: 'Executor applies for probate; your will decides',
      no: 'Intestate Succession Act decides (faraid for Muslims)',
      yesThen: 'Guardian and trustee for children as you named',
      noThen: 'Family applies for Letters of Administration; slower',
      caption: 'With a will, your choices and your executor run the process. Without one, the law fixes the shares and a court appoints who acts.',
      aria: 'Flowchart: with a valid will the executor applies for probate; without one the Intestate Succession Act decides and the family must apply to administer.',
    },
  },

  'lasting-power-of-attorney': {
    quick: {
      intro: 'An LPA is for the years you are alive but cannot decide. Four answers put it in order of urgency for you and your parents.',
      fields: [
        { id: 'have', label: 'Your own LPA', type: 'choice', options: [{ value: 'no', label: 'None' }, { value: 'yes', label: 'Registered' }], default: 'no' },
        { id: 'age', label: 'Your age', type: 'choice', options: [{ value: 'u40', label: 'Under 40' }, { value: '40', label: '40 to 60' }, { value: '60', label: 'Over 60' }], default: 'u40' },
        { id: 'parents', label: 'Parents’ LPAs', type: 'choice', options: [{ value: 'none', label: 'None' }, { value: 'some', label: 'One parent' }, { value: 'both', label: 'Both' }, { value: 'na', label: 'Not applicable' }], default: 'none' },
        { id: 'donee', label: 'Donee chosen and willing', type: 'choice', options: [{ value: 'no', label: 'Not yet' }, { value: 'yes', label: 'Yes' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.parents === 'none' || a.parents === 'some') why.push('For parents, the LPA is the more urgent document: without one, if a parent loses capacity, the family must apply to court to be appointed deputy before touching their accounts or making care decisions.');
        if (a.have === 'no') why.push(a.age === 'u40' ? 'Capacity can be lost at any age through accident or illness; a young, healthy person’s LPA is cheap insurance for the people who would otherwise be stuck.' : 'Making an LPA while capacity is clearly intact avoids any later argument about whether it was valid.');
        if (a.donee === 'no') why.push('Choose a donee who will act in your interest and is practical with money; you can appoint more than one and decide whether they act jointly.');
        why.push('An LPA is made on the OPG’s online portal, certified by an accredited certificate issuer (a doctor, lawyer or psychiatrist) and registered with the Office of the Public Guardian. It only takes effect if capacity is lost.');
        return {
          label: 'Direction',
          verdict: a.parents === 'none' || a.parents === 'some' ? 'Start with your parents’ LPAs' : a.have === 'no' ? 'Make your LPA' : 'In place; review the donees occasionally',
          why,
          next: [official('opg-make-lpa', 'How to make an LPA, costs and certificate issuers.'), guide('advance-care-planning', 'Healthcare wishes, which an LPA does not cover.'), guide('caregiving-plan', 'Where the LPA sits in a care plan.')],
          fine: 'General description of the LPA framework; the Office of the Public Guardian sets the forms, fees and rules.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Loss of mental capacity',
      question: 'LPA registered?',
      yes: 'Your donee acts for you straight away',
      no: 'Family applies to court to be appointed deputy',
      yesThen: 'Bills paid, care decided, within your instructions',
      noThen: 'Months of delay and cost before anyone can act',
      caption: 'The LPA decides who can act, and how fast, if you cannot. Without it, the court decides later.',
      aria: 'Flowchart: with a registered LPA the donee acts immediately; without one the family must apply to court for deputyship.',
    },
  },

  'advance-care-planning': {
    quick: {
      intro: 'Advance Care Planning records how you want to be cared for if you cannot speak for yourself. Four answers show what is missing.',
      fields: [
        { id: 'acp', label: 'Advance Care Plan', type: 'choice', options: [{ value: 'no', label: 'Not done' }, { value: 'yes', label: 'Done' }], default: 'no' },
        { id: 'nhs', label: 'Nominated healthcare spokesperson', type: 'choice', options: [{ value: 'no', label: 'Not named' }, { value: 'yes', label: 'Named and told' }], default: 'no' },
        { id: 'talk', label: 'Talked it through with family', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'who', label: 'This is for', type: 'choice', options: [{ value: 'me', label: 'Me' }, { value: 'parent', label: 'A parent' }, { value: 'both', label: 'Both' }], default: 'both' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.acp === 'no') why.push('An ACP conversation with a trained facilitator takes an hour or two and records your values, the treatments you would or would not want, and who speaks for you. It is free at public healthcare institutions and some community providers.');
        if (a.nhs === 'no') why.push('The nominated healthcare spokesperson is the person doctors turn to. Choose someone who can hold to your wishes under pressure, and tell them.');
        if (a.talk === 'no') why.push('Families who have talked about it argue less at the bedside. The conversation is the point; the document records it.');
        if (a.who !== 'me') why.push('For a parent, start with their values and fears rather than medical detail; AIC’s facilitators are used to leading that conversation.');
        why.push('An ACP is not an LPA (money and welfare decisions) nor an Advance Medical Directive (a specific legal instruction); the three work together.');
        return {
          label: 'Direction',
          verdict: a.acp === 'yes' && a.nhs === 'yes' ? 'In place; revisit after any diagnosis' : 'Book the ACP conversation',
          why,
          next: [official('aic-acp', 'What ACP is and where to do it.'), guide('lasting-power-of-attorney', 'The document for money and welfare decisions.'), guide('make-a-will', 'For after.')],
          fine: 'Describes the ACP framework; MOH and AIC set the process.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Serious illness; you cannot speak for yourself',
      question: 'ACP done, spokesperson named?',
      yes: 'Care follows your recorded wishes',
      no: 'Family and doctors decide without your guidance',
      yesThen: 'Spokesperson speaks with your voice',
      noThen: 'Guesswork, and often disagreement',
      caption: 'The plan matters at the one moment you cannot explain yourself. Everyone else is guessing otherwise.',
      aria: 'Flowchart: with an Advance Care Plan care follows your wishes; without one others decide without guidance.',
    },
  },

  'bereavement-admin': {
    quick: {
      intro: 'The first days are the funeral; the months after are the estate. Say where you are and what exists, and the list orders itself.',
      fields: [
        { id: 'when', label: 'The death was', type: 'choice', options: [{ value: 'days', label: 'In the last few days' }, { value: 'weeks', label: 'Weeks ago' }, { value: 'months', label: 'Months ago' }], default: 'days' },
        { id: 'role', label: 'You are', type: 'choice', options: [{ value: 'exec', label: 'The executor named in the will' }, { value: 'nok', label: 'Next of kin, no will' }, { value: 'help', label: 'Helping the family' }], default: 'nok' },
        { id: 'cpf', label: 'CPF nomination made by the deceased', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
        { id: 'size', label: 'Estate (excluding CPF and nominated insurance)', type: 'choice', options: [{ value: 'small', label: 'Small: a bank account, no property' }, { value: 'large', label: 'Property or larger sums' }], default: 'large' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.when === 'days') why.push('Now: the death certificate (registered digitally by the hospital or doctor), the funeral, and telling employers and close contacts. Nothing else is urgent this week.');
        if (a.cpf === 'yes') why.push('CPF savings go to the nominees directly; CPF Board contacts them. They are not part of the estate.');
        else why.push('Without a CPF nomination, CPF savings go to the Public Trustee, who distributes under intestacy rules; the family applies to the Public Trustee, not the court.');
        if (a.role === 'exec') why.push('As executor you apply for the Grant of Probate; the will names you, so banks will deal with you once the grant is issued.');
        if (a.role === 'nok') why.push(a.size === 'small' ? 'Small estates can be administered by the Public Trustee without a court application, up to the limit the Public Trustee sets; check it before engaging a lawyer.' : 'Without a will, a family member applies for Letters of Administration; this takes longer than probate and the court may require sureties.');
        if (a.role === 'help') why.push('The most useful help is a list: every account, policy, loan, subscription and digital login the person had, with where the documents are.');
        if (a.when !== 'days') why.push('Notify banks, insurers, CPF Board, HDB or the landlord, and IRAS; cancel subscriptions and update utilities. Insurance with a nomination pays the nominee directly.');
        return {
          label: 'Direction',
          verdict: a.when === 'days' ? 'Death certificate and funeral first' : a.role === 'exec' ? 'Apply for probate' : a.size === 'small' ? 'Ask the Public Trustee' : 'Apply for Letters of Administration',
          why,
          next: [official('mylegacy', 'What to do after a death, step by step.'), guide('make-a-will', 'Why the will changes everything that follows.'), tool('annual-admin', 'Put your own affairs in order after this.')],
          fine: 'An ordering of the usual steps, not legal advice. The Public Trustee, the courts and each institution set their own requirements.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'After a death', nodes: ['Death certificate', 'Funeral', 'Notify banks, CPF, insurers', 'Probate or administration', 'Distribute'], wait: { from: 3, to: 4, label: 'months, longer without a will' } }],
      caption: 'The first week is the funeral; the estate takes months. A will and nominations shorten the last two steps considerably.',
      aria: 'Timeline from death certificate through funeral, notifications, probate or administration, to distribution.',
    },
  },
};
