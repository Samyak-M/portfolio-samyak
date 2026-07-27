// Renders the portfolio from resume.json (JSON Resume schema).
// Any section with no data is left hidden (see the `hidden` attribute in index.html).

(async function () {
  let resume;
  try {
    const res = await fetch('resume.json');
    if (!res.ok) throw new Error('Failed to load resume.json (' + res.status + ')');
    resume = await res.json();
  } catch (err) {
    document.getElementById('hero-content').innerHTML =
      '<p role="alert">Could not load résumé data. Please try again later.</p>';
    console.error(err);
    return;
  }

  const $ = (id) => document.getElementById(id);
  const show = (sectionEl) => sectionEl.hidden = false;

  function formatDate(value) {
    if (!value) return '';
    const [year, month] = value.split('-');
    if (!month) return year;
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  function dateRange(start, end) {
    const startLabel = formatDate(start);
    const endLabel = end ? formatDate(end) : 'Present';
    if (!startLabel) return '';
    return `${startLabel} – ${endLabel}`;
  }

  function el(tag, options = {}, children = []) {
    const node = document.createElement(tag);
    if (options.className) node.className = options.className;
    if (options.text) node.textContent = options.text;
    if (options.html) node.innerHTML = options.html;
    if (options.attrs) {
      for (const [key, val] of Object.entries(options.attrs)) node.setAttribute(key, val);
    }
    children.forEach((child) => child && node.appendChild(child));
    return node;
  }

  // ---------- Hero ----------
  const basics = resume.basics || {};
  if (basics.name) {
    const heroContent = $('hero-content');
    const initials = basics.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const avatar = el('div', { className: 'avatar', text: initials, attrs: { 'aria-hidden': 'true' } });
    const heading = el('h1', { text: basics.name });
    const fragments = [avatar, heading];

    if (basics.label) fragments.push(el('p', { className: 'label', text: basics.label }));

    const metaParts = [];
    if (basics.location && (basics.location.city || basics.location.region || basics.location.countryCode)) {
      const loc = [basics.location.city, basics.location.region, basics.location.countryCode]
        .filter(Boolean)
        .join(', ');
      metaParts.push(el('span', { text: loc }));
    }
    if (basics.email) {
      metaParts.push(el('a', { text: basics.email, attrs: { href: `mailto:${basics.email}` } }));
    }
    if (basics.phone) {
      metaParts.push(el('a', { text: basics.phone, attrs: { href: `tel:${basics.phone.replace(/[^+\d]/g, '')}` } }));
    }
    (basics.profiles || []).forEach((profile) => {
      if (!profile) return;
      if (profile.url) {
        metaParts.push(el('a', {
          text: profile.network ? `${profile.network}: ${profile.username || profile.url}` : profile.url,
          attrs: { href: profile.url, target: '_blank', rel: 'noopener noreferrer' },
        }));
      } else if (profile.username) {
        metaParts.push(el('span', { text: `${profile.network ? profile.network + ': ' : ''}${profile.username}` }));
      }
    });

    if (metaParts.length) {
      const meta = el('div', { className: 'hero-meta' });
      metaParts.forEach((part, i) => {
        meta.appendChild(part);
        if (i < metaParts.length - 1) meta.appendChild(el('span', { className: 'divider', text: '•', attrs: { 'aria-hidden': 'true' } }));
      });
      fragments.push(meta);
    }

    fragments.forEach((f) => heroContent.appendChild(f));
    document.title = `${basics.name}${basics.label ? ' — ' + basics.label : ''}`;
  }

  // ---------- About Me ----------
  if (resume.summary) {
    $('about-text').textContent = resume.summary;
    show($('about'));
  } else if (basics.summary) {
    $('about-text').textContent = basics.summary;
    show($('about'));
  }

  // ---------- Work ----------
  if (Array.isArray(resume.work) && resume.work.length) {
    const list = $('work-list');
    resume.work.forEach((job) => {
      const header = el('div', { className: 'entry-header' }, [
        el('h3', { text: [job.position, job.name].filter(Boolean).join(' — ') }),
        el('span', { className: 'dates', text: dateRange(job.startDate, job.endDate) }),
      ]);
      const children = [header];
      if (job.location) children.push(el('p', { className: 'entry-location', text: job.location }));
      if (job.summary) children.push(el('p', { className: 'entry-summary', text: job.summary }));
      if (Array.isArray(job.highlights) && job.highlights.length) {
        const ul = el('ul', { className: 'highlights' });
        job.highlights.forEach((h) => ul.appendChild(el('li', { text: h })));
        children.push(ul);
      }
      list.appendChild(el('article', { className: 'entry' }, children));
    });
    show($('experience'));
  }

  // ---------- Education ----------
  if (Array.isArray(resume.education) && resume.education.length) {
    const list = $('edu-list');
    resume.education.forEach((edu) => {
      const titleParts = [edu.studyType, edu.area].filter(Boolean).join(', ');
      const header = el('div', { className: 'entry-header' }, [
        el('h3', { text: edu.institution || titleParts }),
        el('span', { className: 'dates', text: dateRange(edu.startDate, edu.endDate) }),
      ]);
      const children = [header];
      if (titleParts && edu.institution) children.push(el('p', { className: 'entry-summary', text: titleParts }));
      list.appendChild(el('article', { className: 'entry' }, children));
    });
    show($('education'));
  }

  // ---------- Skills ----------
  if (Array.isArray(resume.skills) && resume.skills.length) {
    const list = $('skill-list');
    resume.skills.forEach((skill) => {
      const children = [el('h3', { text: skill.name })];
      if (skill.level) children.push(el('p', { className: 'skill-level', text: skill.level }));
      if (Array.isArray(skill.keywords) && skill.keywords.length) {
        const tagList = el('ul', { className: 'tag-list' });
        skill.keywords.forEach((kw) => tagList.appendChild(el('li', { className: 'tag', text: kw })));
        children.push(tagList);
      }
      list.appendChild(el('div', { className: 'skill-group' }, children));
    });
    show($('skills'));
  }

  // ---------- Projects ----------
  if (Array.isArray(resume.projects) && resume.projects.length) {
    const list = $('project-list');

    resume.projects.forEach((project) => {
      const cardChildren = [];

      // Card top row: title + optional featured badge
      const topRow = el('div', { className: 'project-card-top' }, [
        el('h3', { text: project.name }),
        ...(project.featured ? [el('span', { className: 'badge-featured', text: 'Featured' })] : []),
      ]);
      cardChildren.push(topRow);

      if (project.description) cardChildren.push(el('p', { className: 'project-desc', text: project.description }));

      // Keywords / tags
      if (Array.isArray(project.keywords) && project.keywords.length) {
        const tagList = el('ul', { className: 'tag-list project-tags' });
        project.keywords.forEach((kw) => tagList.appendChild(el('li', { className: 'tag', text: kw })));
        cardChildren.push(tagList);
      }

      // Subprojects
      if (Array.isArray(project.subprojects) && project.subprojects.length) {
        const subSection = el('div', { className: 'subprojects' });
        subSection.appendChild(el('h4', { text: 'Modules' }));

        project.subprojects.forEach((sub) => {
          const subItemClass = sub.placeholder ? 'subproject-item placeholder' : 'subproject-item';
          const textBlock = el('div', { className: 'subproject-text' }, [
            el('h5', { text: sub.name }),
            ...(sub.description ? [el('p', { text: sub.description })] : []),
          ]);
          const subChildren = [textBlock];
          if (sub.url) {
            subChildren.push(el('a', {
              className: 'project-link',
              text: 'View PoC ↗',
              attrs: { href: sub.url, target: '_blank', rel: 'noopener noreferrer' },
            }));
          }
          subSection.appendChild(el('div', { className: subItemClass }, subChildren));
        });

        cardChildren.push(subSection);
      }

      // Legacy: highlights list
      if (Array.isArray(project.highlights) && project.highlights.length) {
        const ul = el('ul', { className: 'highlights' });
        project.highlights.forEach((h) => ul.appendChild(el('li', { text: h })));
        cardChildren.push(ul);
      }

      // Legacy: top-level url
      if (project.url && !Array.isArray(project.subprojects)) {
        cardChildren.push(el('a', { className: 'project-link', text: 'View project ↗', attrs: { href: project.url, target: '_blank', rel: 'noopener noreferrer' } }));
      }

      list.appendChild(el('article', { className: project.featured ? 'project-card featured' : 'project-card' }, cardChildren));
    });

    // Placeholder card for upcoming projects
    const placeholderCard = el('article', { className: 'project-card placeholder-card' }, [
      el('h3', { text: 'More Projects' }),
      el('p', { text: 'Coming soon' }),
    ]);
    list.appendChild(placeholderCard);

    list.className = 'project-grid';
    show($('projects'));
  }

  // ---------- Blog Articles ----------
  if (Array.isArray(resume.blog) && resume.blog.length) {
    const list = $('blog-list');
    resume.blog.forEach((post) => {
      const isPlaceholder = post.placeholder || !post.url;
      const cardChildren = [
        el('h3', { text: post.title }),
        ...(post.summary ? [el('p', { text: post.summary })] : []),
      ];
      if (post.url) {
        cardChildren.push(el('a', {
          className: 'blog-read-link',
          text: 'Read article →',
          attrs: { href: post.url, target: '_blank', rel: 'noopener noreferrer' },
        }));
      } else {
        cardChildren.push(el('span', { className: 'blog-meta is-coming-soon', text: 'Coming soon' }));
      }
      list.appendChild(el('article', { className: isPlaceholder ? 'blog-card placeholder' : 'blog-card' }, cardChildren));
    });
    list.className = 'blog-grid';
    show($('blog'));
  }

  // ---------- Certificates ----------
  if (Array.isArray(resume.certificates) && resume.certificates.length) {
    const list = $('cert-list');
    resume.certificates.forEach((cert) => {
      const text = [cert.name, cert.issuer ? `— ${cert.issuer}` : '', cert.date ? `(${formatDate(cert.date)})` : '']
        .filter(Boolean)
        .join(' ');
      list.appendChild(el('li', { text }));
    });
    show($('certificates'));
  }

  // ---------- Awards ----------
  if (Array.isArray(resume.awards) && resume.awards.length) {
    const list = $('award-list');
    resume.awards.forEach((award) => {
      const text = [award.title, award.awarder ? `— ${award.awarder}` : '', award.date ? `(${award.date})` : '']
        .filter(Boolean)
        .join(' ');
      list.appendChild(el('li', { text }));
    });
    show($('awards'));
  }

  // ---------- Contact ----------
  if (basics.email) {
    $('contact-text').textContent = `Reach out at ${basics.email}${basics.phone ? ' or ' + basics.phone : ''}.`;
    $('contact-btn').setAttribute('href', `mailto:${basics.email}`);
    show($('contact'));
  }

  // ---------- Footer ----------
  if (basics.name) {
    $('footer-text').textContent = `© ${new Date().getFullYear()} ${basics.name}`;
  }

  // ---------- Nav: hide links for empty sections ----------
  document.querySelectorAll('#site-nav .nav-link').forEach((link) => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target && target.hidden) {
      link.closest('li').hidden = true;
    }
  });

  // ---------- Active section highlight (IntersectionObserver) ----------
  const sections = Array.from(document.querySelectorAll('main section[id]:not([hidden])'));
  const navLinks = Array.from(document.querySelectorAll('#site-nav .nav-link'));

  function setActive(id) {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute('href') === '#' + id;
      link.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
  }

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    // Set first visible section as initially active
    if (sections[0]) setActive(sections[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // ---------- Mobile nav toggle ----------
  const navToggle = $('nav-toggle');
  const navList = $('nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a section link is tapped
    navList.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link')) {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
