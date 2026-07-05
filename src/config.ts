import type { SocialObjects } from "./types";

export const SITE = {
  website: "https://ovcharski.com/",
  author: "Nikola Ovcharski",
  desc: "A dev blog and portfolio.",
  title: "Nikola Ovcharski",
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
    href: "https://bg.linkedin.com/in/nikola-ovcharski-46225718",
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
