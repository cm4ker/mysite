import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';
import './Contact.css';

interface ContactItem {
  title: string;
  value: string;
  icon: [IconPrefix, IconName];
  href?: string;
}

const Contact: React.FC = () => {
  const contacts: ContactItem[] = [
    { 
      title: 'Email', 
      value: 'cm4ker@gmail.com',
      icon: ['fas', 'envelope'],
      href: 'mailto:cm4ker@gmail.com'
    },
    { 
      title: 'GitHub', 
      value: 'github.com/cm4ker',
      icon: ['fab', 'github'],
      href: 'https://github.com/cm4ker'
    },
    { 
      title: 'Telegram', 
      value: '@cm4ker',
      icon: ['fab', 'telegram'],
      href: 'https://t.me/cm4ker'
    },
    { 
      title: 'Twitter', 
      value: '@cm4ker',
      icon: ['fab', 'twitter'],
      href: 'https://twitter.com/cm4ker'
    }
  ];

  return (
    <section id="contact">
      <h2>Свяжитесь со мной</h2>
      <div className="grid">
        {contacts.map((contact, index) => {
          const isExternal = contact.href?.startsWith('http');
          return (
            <a 
              key={index} 
              href={contact.href}
              {...(isExternal && { 
                target: '_blank', 
                rel: 'noopener noreferrer' 
              })}
              className="card contact-card" 
              tabIndex={0}
            >
              <div className="contact-icon">
                <FontAwesomeIcon icon={contact.icon} />
              </div>
              <h3>{contact.title}</h3>
              <p>{contact.value}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default Contact;
