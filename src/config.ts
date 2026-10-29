import type { SocialObjects } from "./types";

export const SITE = {
  website: "https://ovcharski.com/",
  author: "Nikola Ovcharski",
  desc: "Nikola Ovcharski's dev blog: QA automation, Playwright and testing tools, plus Raspberry Pi tinkering, old gadgets and the odd car rabbit hole.",
  title: "Nikola Ovcharski",
  homeTitle: "Nikola Ovcharski – QA Automation, Playwright & Dev Notes",
  ogImage: "NikolaOvcharski.jpg",
  lightAndDarkMode: false,
  postPerPage: 10,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/ovcharski",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/nikolaovcharski/",
    linkTitle: `${SITE.title} on Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/nikola-ovcharski/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "nikola@ovcharski.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/ovcharski",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
];
