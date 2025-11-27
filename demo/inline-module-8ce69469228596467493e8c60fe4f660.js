// Known issue, scoped registry polyfill doesn't load as fast as oscd-shell, causing oscs-shell to fail.
      // To safeguard, we await the polyfill first, then load the rest.
      await import('./scoped-custom-element-registry.min-rSxJSIou.js');
      await import('./oscd-shell-CdK78eDp.js');
      await import('./index-Dt55Kf_Q.js');
