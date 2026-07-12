//===============================================================
// メニュー制御用の関数とイベント設定（※最初から3本線メニュー統一版）
//===============================================================
$(function(){
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const $overlay = $('#menubar-overlay');
  
  // 常に三本線メニューにするため、ブレイクポイントを極端に大きく設定
  const breakPoint = 9999; 

  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0) ||
                       (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // メニューを閉じる共通関数
  //-------------------------------------------------
  function closeMenu() {
    $menubarHdr.removeClass('ham');
    $menubar.hide();
    $overlay.hide();
    $menubar.find('.ddmenu_parent ul').hide();
    $('body').removeClass('noscroll');
  }

  //-------------------------------------------------
  // メニューを開く共通関数
  //-------------------------------------------------
  function openMenu() {
    $menubarHdr.addClass('ham');
    $menubar.show();
    $overlay.show();
    $menubar.find('.ddmenu_parent ul').hide();
    $('body').addClass('noscroll');
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    $menu.find('.ddmenu_parent ul').hide();

    $menu.find('.ddmenu').off('click.ddmenu');
    $menu.find('.ddmenu_parent').off('mouseenter.ddmenu mouseleave.ddmenu');

    // 常にクリックで開閉に統一
    $menu.find('.ddmenu').on('click.ddmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const $dropdownMenu = $(this).siblings('ul');
      if ($dropdownMenu.is(':visible')) {
        $dropdownMenu.hide();
      } else {
        $menu.find('.ddmenu_parent ul').hide();
        $dropdownMenu.show();
      }
    });
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger) {
    let isAnimating = false;
    $hamburger.on('click', function() {
      if (isAnimating) return;
      isAnimating = true;

      if ($(this).hasClass('ham')) {
        closeMenu();
      } else {
        openMenu();
      }

      setTimeout(function() { isAnimating = false; }, 300);
    });
  }

  //-------------------------------------------------
  // オーバーレイクリックでメニューを閉じる
  //-------------------------------------------------
  $overlay.on('click', function() {
    closeMenu();
  });

  //-------------------------------------------------
  // 表示制御 (リサイズ時も常に三本線モードを維持)
  //-------------------------------------------------
  const handleResize = debounce(function() {
    $('body').removeClass('large-screen').addClass('small-screen');
    $menubarHdr.show();
    if (!$menubarHdr.hasClass('ham')) {
      $menubar.hide();
      $overlay.hide();
      $('body').removeClass('noscroll');
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  initDropdown($menubar, isTouchDevice);
  initHamburger($menubarHdr);
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント（メニューを安全に閉じる）
  //-------------------------------------------------
  $menubar.find('a[href^="#"]').on('click', function() {
    if ($(this).hasClass('ddmenu')) return;
    // スムーススクロール側の計算を邪魔しないよう、ここでは何もしない（スクロールイベント側で制御）
  });
});


//===============================================================
// スムーススクロール（※メニュー即時連動対応版）
//===============================================================
$(function() {
    var scrollType = 'normal';
    var fixedHeaderSelector = '#menubar';
    var topButton = $('.pagetop');
    var scrollShow = 'pagetop-show';

    function getHeaderOffset() {
        return 0; // メニューが横から出るタイプのため、ヘッダー分の被り相殺は0で固定
    }

    function smoothScroll(target) {
        var scrollTo = 0;
        if(target === '#') {
            scrollTo = 0;
        } else {
            var $target = $(target);
            if(!$target.length) {
                return;
            }
            scrollTo = $target.offset().top - getHeaderOffset();
            if(scrollTo < 0) {
                scrollTo = 0;
            }
        }
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

  //===========================================================
  // ページ内リンククリック時の処理
  //===========================================================
  $('a[href^="#"], .pagetop').click(function(e) {
    var id = $(this).attr('href') || '#';

    if(id === '#' && !$(this).hasClass('pagetop')) {
      return;
    }

    if ($(id).length || id === '#') {
      e.preventDefault();

      // 1. 位置計算をしてからスムーズスクロールを開始
      smoothScroll(id);

      // 2. スクロール開始と同時に、三本線メニューのガワとロックを解除
      $('#menubar_hdr').removeClass('ham');
      $('#menubar-overlay').hide();
      $('body').removeClass('noscroll');
      
      // 3. メニュー本体は一瞬だけ遅らせて消す（位置計算のエラーフリーズを完全回避）
      setTimeout(function() {
        $('#menubar').hide();
      }, 100);
    }
  });

    // ページトップボタンの表示切り替え
    $(topButton).hide();
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) {
            $(topButton).fadeIn().addClass(scrollShow);
        } else {
            $(topButton).fadeOut().removeClass(scrollShow);
        }
    });

    if(window.location.hash) {
        $('html, body').scrollTop(0);
        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 500);
    }
});


//===============================================================
// スライドショー（ズーム）
//===============================================================
$(function() {
  $('.mainimg').each(function() {
    var $root = $(this);
    var slides = $root.find('.slide');
    var slideCount = slides.length;
    var currentIndex = 0;

    function cssTimeToMs(v) {
      v = (v || '').toString().trim();
      if (!v) return 0;
      if (v.indexOf('ms') > -1) return Math.round(parseFloat(v));
      if (v.indexOf('s') > -1)  return Math.round(parseFloat(v) * 1000);
      var n = parseFloat(v);
      return isNaN(n) ? 0 : Math.round(n);
    }

    function getTransitionMs(el, propName) {
      var st = window.getComputedStyle(el);
      var props = (st.transitionProperty || '').split(',');
      var durs  = (st.transitionDuration || '').split(',');
      var dels  = (st.transitionDelay || '').split(',');

      function pick(list, i) {
        if (!list.length) return '0s';
        return (list[i] !== undefined ? list[i] : list[list.length - 1]).trim();
      }

      for (var i = 0; i < props.length; i++) {
        var p = props[i].trim();
        if (p === propName || p === 'all') {
          return cssTimeToMs(pick(durs, i)) + cssTimeToMs(pick(dels, i));
        }
      }
      return 0;
    }

    var INTERVAL = 5000;
    var FADE_MS = getTransitionMs(slides.get(0), 'opacity');
    if (!FADE_MS) FADE_MS = 1000;
    var ZOOM_MS = INTERVAL + FADE_MS;

    var autoTimer = null;
    var isAnimating = false;

    var $indicators = $root.find('.slide-indicators').empty();
    for (var i = 0; i < slideCount; i++) {
      $indicators.append('<span class="indicator" data-index="' + i + '"></span>');
    }
    var $dots = $indicators.find('.indicator');

    slides.find('img').css('transition', 'transform ' + ZOOM_MS + 'ms linear');

    function resetZoom($slide) {
      var $img = $slide.find('img');
      $img.css('transition', 'none');
      $slide.removeClass('zoom');
      if ($img[0]) { $img[0].offsetHeight; }
      $img.css('transition', 'transform ' + ZOOM_MS + 'ms linear');
    }

    function startZoom($slide) {
      window.requestAnimationFrame(function() {
        $slide.addClass('zoom');
      });
    }

    slides.css('opacity', 0).removeClass('active');
    slides.each(function() { resetZoom($(this)); });

    slides.eq(0).css('opacity', 1).addClass('active');
    $dots.removeClass('active').eq(0).addClass('active');
    startZoom(slides.eq(0));

    function setActive(nextIndex) {
      if (nextIndex === currentIndex) return;
      isAnimating = true;

      var $current = slides.eq(currentIndex);
      var $next = slides.eq(nextIndex);

      resetZoom($next);

      $current.css('opacity', 0).removeClass('active');
      $next.css('opacity', 1).addClass('active');

      startZoom($next);

      $dots.eq(currentIndex).removeClass('active');
      $dots.eq(nextIndex).addClass('active');

      var prevIndex = currentIndex;
      currentIndex = nextIndex;

      setTimeout(function() {
        resetZoom(slides.eq(prevIndex));
        isAnimating = false;
      }, FADE_MS);
    }

    function next() {
      var n = (currentIndex + 1) % slideCount;
      setActive(n);
      restartTimer();
    }

    function restartTimer() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(next, INTERVAL);
    }

    $dots.on('click', function() {
      var to = $(this).data('index');
      if (isAnimating) return;
      if (to === currentIndex) {
        return restartTimer();
      }
      setActive(to);
      restartTimer();
    });

    restartTimer();
  });
});


//===============================================================
// サムネイルの横スライドショー（複数設置対応）
//===============================================================
$(function() {
  var slideDuration = 1000;
  var autoSlideInterval = 4000;

  function initOneSlider($slider) {
    $slider.find('.list').each(function() {
      $(this)
        .off('inview')
        .removeClass('inview up upstyle down downstyle transform1 transform1style transform2 transform2style transform3 transform3style blur blurstyle');
    });
    if ($slider.children('.img').length === 0) {
      $slider.children('.list').wrapAll('<div class="img"></div>');
    }
    if ($slider.children('.slide-indicators-parts').length === 0) {
      $slider.append('<div class="slide-indicators-parts"></div>');
    }

    var imagesPerView, slideBy;
    var isAnimating = false;
    var currentImageIndex = 0;
    var pendingIndex = null;

    var $imgParts = $slider.find('.img');
    var $indicatorsArea = $slider.find('.slide-indicators-parts');

    stopAutoSlide();
    $imgParts.find('.clone').remove();
    $indicatorsArea.empty();

    var $divs = $imgParts.children('div').not('.clone');
    var totalImages = $divs.length;

    if (totalImages <= 1) {
      $imgParts.css({ 'transition': 'none', 'transform': 'translateX(0)' });
      return;
    }

    var windowWidth = $(window).width();
    if (windowWidth >= 801) {
      imagesPerView = 4;
      slideBy = 2;
    } else {
      imagesPerView = 2;
      slideBy = 1;
    }

    if (totalImages <= imagesPerView) {
      $imgParts.css({ 'transition': 'none', 'transform': 'translateX(0)' });
      return;
    }

    $divs.clone().addClass('clone').appendTo($imgParts);

    var totalSlides = Math.ceil(totalImages / slideBy);
    for (var i = 0; i < totalSlides; i++) {
      $indicatorsArea.append('<span class="indicator" data-index="' + (i * slideBy) + '"></span>');
    }
    var $indicatorItems = $indicatorsArea.find('.indicator');

    function updateIndicators() {
      var activeIndex = Math.floor(currentImageIndex / slideBy) % totalSlides;
      $indicatorItems.removeClass('active');
      $indicatorItems.eq(activeIndex).addClass('active');
    }

    function slideTo(index) {
      if (isAnimating) return;
      isAnimating = true;
      currentImageIndex = index;

      $imgParts.css({
        'transition': 'transform ' + (slideDuration / 1000) + 's ease',
        'transform': 'translateX(' + (-currentImageIndex * (100 / imagesPerView)) + '%)'
      });

      updateIndicators();

      setTimeout(function() {
        if (currentImageIndex >= totalImages) {
          $imgParts.css('transition', 'none');
          $imgParts.css('transform', 'translateX(0)');
          currentImageIndex = 0;
          updateIndicators();
          $imgParts[0].offsetHeight;
          $imgParts.css('transition', 'transform ' + (slideDuration / 1000) + 's ease');
        }
        isAnimating = false;

        if (pendingIndex !== null) {
          var next = pendingIndex;
          pendingIndex = null;
          slideTo(next);
          startAutoSlide();
        }
      }, slideDuration);
    }

    function startAutoSlide() {
      stopAutoSlide();
      var interval = setInterval(function() {
        slideTo(currentImageIndex + slideBy);
      }, autoSlideInterval);
      $slider.data('interval', interval);
    }

    function stopAutoSlide() {
      var interval = $slider.data('interval');
      if (interval) {
        clearInterval(interval);
        $slider.removeData('interval');
      }
    }

    $imgParts.css({ 'transition': 'none', 'transform': 'translateX(0)' });
    updateIndicators();
    startAutoSlide();

    $slider.off('.auto1')
      .on('mouseenter.auto1', function() { stopAutoSlide(); })
      .on('mouseleave.auto1', function() { startAutoSlide(); });

    $indicatorItems.off('.auto1').on('click.auto1', function() {
      var index = $(this).data('index');
      stopAutoSlide();
      if (isAnimating) {
        pendingIndex = index;
        return;
      }
      slideTo(index);
      startAutoSlide();
    });
  }

  function initAllSliders() {
    $('.list-auto').each(function() {
      initOneSlider($(this));
    });
  }

  initAllSliders();

  var resizeTimer;
  $(window).off('.auto1resize').on('resize.auto1resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      initAllSliders();
    }, 250);
  });
});