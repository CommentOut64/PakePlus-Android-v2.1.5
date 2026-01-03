window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});(function(){
  try {
    // ====== 保留并重写你的 hookClick / window.open (与现有行为兼容) ======
    const hookClick = (e) => {
      const origin = e.target && e.target.closest && e.target.closest('a');
      const isBaseTargetBlank = document.querySelector && document.querySelector('head base[target="_blank"]');
      console && console.log && console.log('origin', origin, isBaseTargetBlank);
      if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
      ) {
        e.preventDefault();
        console && console.log && console.log('handle origin', origin);
        location.href = origin.href;
      } else {
        console && console.log && console.log('not handle origin', origin);
      }
    };
    window.open = function (url, target, features) {
      console && console.log && console.log('open', url, target, features);
      location.href = url;
    };
    // attach if not already attached
    if(!window.__pakeplus_hook_installed){
      document.addEventListener('click', hookClick, { capture: true });
      window.__pakeplus_hook_installed = true;
    }

    // ====== 键盘/视口处理逻辑 ======
    // 配置：滚动到 center（可改为 'nearest' 或 'end'）
    const SCROLL_BLOCK = 'center';
    // 防抖 / 节流标记
    let pending = false;
    let lastViewportHeight = window.innerHeight || document.documentElement.clientHeight;
    // 设置 body padding-bottom 为键盘高度（像素），并滚动焦点元素可见
    function applyKeyboardOffset(kbHeight) {
      try {
        // limit max padding to avoid layout 乱跑
        const maxPad = Math.round((window.innerHeight || 0) * 0.9);
        const pad = Math.min(kbHeight || 0, maxPad);
        document.body.style.transition = 'padding-bottom 150ms ease';
        document.body.style.paddingBottom = pad + 'px';
      } catch (e) { console && console.warn && console.warn('applyKeyboardOffset failed', e); }
    }
    function clearKeyboardOffset() {
      try {
        document.body.style.paddingBottom = '';
      } catch (e) {}
    }
    function scrollFocusedIntoView() {
      try {
        const el = document.activeElement;
        if (!el) return;
        const tag = (el.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || el.isContentEditable) {
          // small timeout to wait for viewport resize/keyboard animation
          setTimeout(() => {
            try {
              if (typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: SCROLL_BLOCK, inline: 'nearest' });
              } else {
                const r = el.getBoundingClientRect();
                const y = window.pageYOffset + r.top - (window.innerHeight/2) + (r.height/2);
                window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'smooth' });
              }
            } catch (e) {}
          }, 50);
        }
      } catch (e) {}
    }

    // VisualViewport path (preferred)
    if (window.visualViewport) {
      const vv = window.visualViewport;
      const onVVResize = () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          const vvHeight = vv.height; // visual viewport height (content area not covered)
          const winH = window.innerHeight || document.documentElement.clientHeight;
          const kbHeight = Math.max(0, winH - vvHeight);
          if (kbHeight > 0) {
            applyKeyboardOffset(kbHeight);
            scrollFocusedIntoView();
          } else {
            // keyboard hidden
            clearKeyboardOffset();
          }
          lastViewportHeight = vvHeight;
        });
      };
      vv.addEventListener('resize', onVVResize);
      vv.addEventListener('scroll', onVVResize);
      // focus events to ensure scroll when input focused
      document.addEventListener('focusin', () => {
        setTimeout(() => { scrollFocusedIntoView(); }, 70);
      });
      document.addEventListener('focusout', () => {
        setTimeout(() => { clearKeyboardOffset(); }, 120);
      });
    } else {
      // Fallback: detect window.innerHeight change (older WebView)
      window.addEventListener('resize', () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          const newH = window.innerHeight || document.documentElement.clientHeight;
          const kbHeight = Math.max(0, lastViewportHeight - newH);
          if (kbHeight > 150) { // threshold to avoid false positives
            applyKeyboardOffset(kbHeight);
            scrollFocusedIntoView();
          } else if (kbHeight <= 0) {
            clearKeyboardOffset();
          }
          lastViewportHeight = newH;
        });
      });
      // also do focusin to try force-scroll
      document.addEventListener('focusin', () => {
        setTimeout(() => { scrollFocusedIntoView(); }, 80);
      });
      document.addEventListener('focusout', () => {
        setTimeout(() => { clearKeyboardOffset(); }, 120);
      });
    }

    // Optional: prevent bottom fixed elements from being hidden badly
    // You can add a small CSS helper. (Uncomment to apply)
    /*
    (function addCss(){
      var css = '.avoid-fixed-bottom{ position: fixed !important; bottom: 0 !important; will-change: transform; }';
      var s = document.createElement('style'); s.appendChild(document.createTextNode(css));
      document.head && document.head.appendChild(s);
    })();
    */

    console && console.log && console.log('pakeplus keyboard helper installed');
  } catch (err) {
    console && console.warn && console.warn('pakeplus keyboard helper failed', err);
  }
})();
