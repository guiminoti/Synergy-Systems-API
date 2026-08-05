/* Synergy Systems Developer Portal — vanilla JS interactions */
(function () {
  'use strict';

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll reveal (respects prefers-reduced-motion)
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll(
      '.feature, .doc-card, .endpoint, .code-block, .price-card'
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity .45s ease, transform .45s ease';
      io.observe(el);
    });
  }

  // ═══════════════════ HERO CHAT DEMO ═══════════════════
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');
  var chatBody = document.getElementById('chatBody');
  var chatTyping = document.getElementById('chatTyping');
  var chatChips = document.getElementById('chatChips');

  if (chatForm && chatInput && chatBody) {
    var REPLIES = [
      {
        test: /product|enrich|fruit salad/i,
        kind: 'Product enrichment',
        body:
          '<p>I enriched <strong>“Fresh fruit salad”</strong> against the product profile engine:</p>' +
          '<ul>' +
          '<li>Matched category: packaged fruit preparations</li>' +
          '<li>Nutrients highlighted: vitamin C, dietary fiber, natural sugars</li>' +
          '<li>Scientific flags: none — no unsupported claims detected</li>' +
          '</ul>',
        snippet:
'{\n' +
'  "product": "Fresh fruit salad",\n' +
'  "status": "enriched",\n' +
'  "confidence": 0.92\n' +
'}',
        meta: 'POST /v1/products/enrich · api_version v1.1'
      },
      {
        test: /\bspinach\b|leafy|greens|vegetable/i,
        kind: 'Discovery',
        body:
          '<p>I queried the knowledge base for <strong>spinach</strong> — here is the top of the discovery result:</p>' +
          '<ul>' +
          '<li><strong>Spinach</strong> <em>(Spinacia oleracea)</em> · food · confidence 0.97</li>' +
          '<li>Signature compounds: nitrates, folate, vitamin K1, lutein, zeaxanthin</li>' +
          '<li>Proposed roles: blood-pressure modulation, vision support</li>' +
          '</ul>' +
          '<p>Full provenance (DOIs and data version) is attached to every item in the real response.</p>',
        snippet:
'{\n' +
'  "query": "spinach",\n' +
'  "total": 14,\n' +
'  "confidence": 0.97,\n' +
'  "evidence_level": "curated"\n' +
'}',
        meta: 'GET /v1/discovery/search?q=spinach · api_version v1.1'
      },
      {
        test: /\bvitamin\s*d\b|\bvit\s*d\b|calciferol/i,
        kind: 'Explain',
        body:
          '<p><strong>Vitamin D</strong> (cholecalciferol) is a fat-soluble secosteroid that works as a nuclear-receptor ligand. It regulates calcium–phosphate homeostasis and supports innate immunity (e.g. via cathelicidin).</p>' +
          '<ul>' +
          '<li>Verified interaction: calcium absorption</li>' +
          '<li>Verified interaction: PTH suppression</li>' +
          '<li>Notable dietary sources: oily fish, UV-exposed mushrooms, fortified foods</li>' +
          '</ul>',
        meta: 'GET /v1/explain/compounds/CHEBI:28939 · api_version v1.1'
      },
      {
        test: /nrf2|nfe2l2|antioxidant|oxidative/i,
        kind: 'Mechanism',
        body:
          '<p><strong>NRF2</strong> (NFE2L2) is the master transcription factor of the antioxidant response element (ARE). Under oxidative stress it translocates to the nucleus and up-regulates ~200 cytoprotective genes (HMOX1, NQO1, GSTs).</p>' +
          '<p>Associated compounds in the knowledge base: sulforaphane (broccoli), curcumin, resveratrol.</p>',
        meta: 'GET /v1/discovery/search?q=nrf2 · api_version v1.1'
      },
      {
        test: /inflamm|omega|curcumin|ginger|pain/i,
        kind: 'Recommend',
        body:
          '<p>Evidence-gated recommendations for <strong>inflammation</strong>:</p>' +
          '<ul>' +
          '<li><strong>Omega-3 (EPA/DHA)</strong> — moderate evidence</li>' +
          '<li><strong>Curcumin</strong> — moderate evidence · note low bioavailability</li>' +
          '<li><strong>Ginger (gingerols)</strong> — preliminary evidence</li>' +
          '</ul>' +
          '<p>Each suggestion ships with its rationale and source DOIs in the full response.</p>',
        meta: 'GET /v1/recommend/conditions/inflammation · api_version v1.1'
      },
      {
        test: /.*/,
        kind: 'Assistant',
        body:
          '<p>I didn’t find a scripted demo for that — but the knowledge base can answer things like:</p>' +
          '<ul>' +
          '<li>“What are the benefits of spinach?”</li>' +
          '<li>“Explain vitamin D”</li>' +
          '<li>“Recommend foods for inflammation”</li>' +
          '<li>“Enrich this product: fresh fruit salad”</li>' +
          '</ul>' +
          '<p>This widget is a simulated preview — the real API answers any scientific question with provenance.</p>',
        meta: 'demo mode · responses are illustrative'
      }
    ];

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function scrollChat() {
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addUserMessage(text) {
      var msg = document.createElement('div');
      msg.className = 'chat__msg chat__msg--user';
      msg.innerHTML = '<p>' + escapeHtml(text) + '</p>';
      chatBody.insertBefore(msg, chatTyping);
      scrollChat();
    }

    function addAssistantMessage(reply) {
      var html = '<p class="chat__reply-kind">' + reply.kind + '</p>' + reply.body;
      if (reply.snippet) html += '<pre class="chat__snippet">' + reply.snippet + '</pre>';
      if (reply.meta) html += '<span class="chat__meta">' + reply.meta + '</span>';
      var msg = document.createElement('div');
      msg.className = 'chat__msg chat__msg--assistant';
      msg.innerHTML = html;
      chatBody.insertBefore(msg, chatTyping);
      scrollChat();
    }

    function send(query) {
      if (!query.trim()) return;
      addUserMessage(query.trim());
      chatTyping.hidden = false;
      scrollChat();
      var reply = null;
      for (var i = 0; i < REPLIES.length; i++) {
        if (REPLIES[i].test.test(query)) { reply = REPLIES[i]; break; }
      }
      var delay = 700 + Math.min(query.length * 6, 1400);
      window.setTimeout(function () {
        chatTyping.hidden = true;
        addAssistantMessage(reply || REPLIES[REPLIES.length - 1]);
      }, delay);
    }

    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = chatInput.value;
      chatInput.value = '';
      send(q);
      chatInput.focus();
    });

    var chatEl = document.getElementById('chat');
    var chatExpand = document.getElementById('chatExpand');

    function setExpanded(expanded) {
      if (expanded) {
        chatEl.classList.add('chat--expanded');
        document.body.classList.add('chat-open');
      } else {
        chatEl.classList.remove('chat--expanded');
        document.body.classList.remove('chat-open');
      }
      chatExpand.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      chatExpand.setAttribute('aria-label', expanded ? 'Restore chat' : 'Expand chat');
      chatExpand.setAttribute('title', expanded ? 'Restore chat' : 'Expand chat');
      window.setTimeout(scrollChat, 80);
    }

    if (chatEl && chatExpand) {
      chatExpand.addEventListener('click', function () {
        setExpanded(!chatEl.classList.contains('chat--expanded'));
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && chatEl.classList.contains('chat--expanded')) {
          setExpanded(false);
          chatExpand.focus();
        }
      });
    }

    if (chatChips) {
      chatChips.addEventListener('click', function (e) {
        var chip = e.target.closest ? e.target.closest('.chat__chip') : null;
        if (!chip) return;
        send(chip.getAttribute('data-q'));
      });
    }
  }
})();
