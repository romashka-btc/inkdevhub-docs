import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import React from 'react';
import '../../css/homepage-features.scss';

type FeatureItem = {
  title: JSX.Element;
  link: string;
  iconClass: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  
  {
    title: <Translate>Build</Translate>,
    link: '/docs/build/',
    iconClass: 'wrench',
    description: (
      <>
        <Translate>
          Discover all the essential resources to begin writing, testing, 
          deploying, and engaging with smart contracts utilizing ink!
        </Translate>
      </>
    ),
  },
    {
    title: <Translate>Learn</Translate>,
    link: '/docs/learn/',
    iconClass: 'docs',
    description: (
      <>
        <Translate>
          Gain valuable insights and hands-on experience with 
          smart contract development through tutorial, examples and more.
        </Translate>
      </>
    ),
  },
];

function Feature({ title, iconClass, description, link }: FeatureItem) {
  return (
    <Link to={link} className="box">
      <div className="row--title">
        <div className={`${iconClass} icon`} />
        <span className="text--title">{title}</span>
      </div>
      <div className="row--description">
        <span className="text--description">{description}</span>
      </div>
    </Link>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className="section--front-page">
      <div className="container--front-page">
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}
