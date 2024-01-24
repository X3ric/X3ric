// Cursor

  const cursor = document.getElementById('cursor');
  let lastX = 0;
  let lastY = 0;
  let isResizing = false;

  function animate() {
      cursor.style.left = lastX + 'px';
      cursor.style.top = lastY + 'px';
      requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', function(e) {
      cursorpoint.style.left = e.clientX + 'px'; 
      cursorpoint.style.top = e.clientY + 'px';
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      if (!isResizing) {
          cursor.style.width = "15px";
          cursor.style.height = "15px";
          isResizing = true;
          setTimeout(() => {
              cursor.style.width = "0px";
              cursor.style.width = "0px";
              cursor.style.height = "0px";
              isResizing = false;
          }, 300);
      }
  });

  animate();

// Animation Background

  var width, height, container, canvas, ctx, points, target, animateHeader = true;
  var circleRadius = Math.min(width, height) / 2;
  
  function init() {
    initHeader();
    initAnimation();
    addListeners();
  }

  function initHeader() {
    width = window.innerWidth;
    height = window.innerHeight;
    target = {
    x: width / 2,
    y: height / 2
    };
    container = document.getElementById('connecting-dots');
    container.style.height = height + 'px';
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    points = [];
    for (var x = 0; x < width; x = x + width / 20) {
    for (var y = 0; y < height; y = y + height / 20) {
      var px = x + Math.random() * width / 100;
      var py = y + Math.random() * height / 100;
      var p = {
        x: px,
        originX: px,
        y: py,
        originY: py
      };
      points.push(p);
    }
    }
    for (var i = 0; i < points.length; i++) {
    var closest = [];
    var p1 = points[i];
    for (var j = 0; j < points.length; j++) {
      var p2 = points[j]
      if (!(p1 == p2)) {
        var placed = false;
        for (var k = 0; k < 5; k++) {
          if (!placed) {
            if (closest[k] == undefined) {
              closest[k] = p2;
              placed = true;
            }
          }
        }
        for (var k = 0; k < 5; k++) {
          if (!placed) {
            if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
              closest[k] = p2;
              placed = true;
            }
          }
        }
      }
    }
    p1.closest = closest;
    }
    for (var i in points) {
      if (document.querySelector('body').classList.contains('light')) {
        var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(0,0,0,0.9)');
      } else {
        var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.9)');
      }
      points[i].circle = c;
    }
  }

  function updateRandomTarget() {
    var newTargetX = Math.random() * width;
    var newTargetY = Math.random() * height;

    TweenLite.to(target, 3, {
        x: newTargetX,
        y: newTargetY,
        ease: Circ.easeInOut
    });
  }

  function addListeners() {
    setInterval(updateRandomTarget, 1000);
    //if (!('ontouchstart' in window)) { // move animation to mouse position
      //window.addEventListener("mousemove", mouseMove);
    //}
    window.addEventListener("resize", resize, true);
    window.addEventListener("scroll", scrollCheck);
  }

  function mouseMove(e) {
    var posx = posy = 0;
    if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
    } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    target.x = posx;
    target.y = posy;
  }

  function scrollCheck() {
    if (document.body.scrollTop > height) animateHeader = false;
    else animateHeader = true;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    container.style.height = height + 'px';
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  }

  function initAnimation() {
    animate();
    for (var i in points) {
    shiftPoint(points[i]);
    }
  }

  var spawnRadiusMultiplier = 1;
  var expanding = false;
  var shrinking = false;

  function animate() {
      if (animateHeader) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (var i in points) {
              if (Math.abs(getDistance(target, points[i])) < 4000 * spawnRadiusMultiplier) {
                  points[i].active = 0.3;
                  points[i].circle.active = 0.6;
              } else if (Math.abs(getDistance(target, points[i])) < 20000 * spawnRadiusMultiplier) {
                  points[i].active = 0.1;
                  points[i].circle.active = 0.3;
              } else if (Math.abs(getDistance(target, points[i])) < 40000 * spawnRadiusMultiplier) {
                  points[i].active = 0.02;
                  points[i].circle.active = 0.1;
              } else {
                  points[i].active = 0;
                  points[i].circle.active = 0;
              }
              drawLines(points[i]);
              points[i].circle.draw();
          }
          if (expanding) {
              spawnRadiusMultiplier += 0.03;
              if (spawnRadiusMultiplier >= 5) {
                  expanding = false;
                  shrinking = true;
              }
          }
          if (shrinking) {
              spawnRadiusMultiplier -= 0.03;
              if (spawnRadiusMultiplier <= 1) {
                  spawnRadiusMultiplier = 1;
                  shrinking = false;
              }
          }
      }
      requestAnimationFrame(animate);
  }

  function shiftPoint(p) {
    TweenLite.to(p, 1 + 1 * Math.random(), {
    x: p.originX - 50 + Math.random() * 100,
    y: p.originY - 50 + Math.random() * 100,
    ease: Circ.easeInOut,
    onComplete: function() {
      shiftPoint(p);
    }
    });
  }

  function drawLines(p) {
    if (!p.active) return;
    for (var i in p.closest) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.closest[i].x, p.closest[i].y);
    if (document.querySelector('body').classList.contains('light')) {
      ctx.strokeStyle = 'rgba(0,0,0,' + p.active + ')';
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,' + p.active + ')';
    }
    ctx.stroke();
    }
  }

  function Circle(pos, rad, color) {
    this.pos = pos || null;
    this.originalRadius = rad;
    this.radius = rad || null;
    this.color = color || null;
    this.shape = 'circle'; // circle, triangle, square
    this.draw = function() {
        if (!this.active) return;
        ctx.beginPath();
        if (this.shape === 'circle') {
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        } else if (this.shape === 'triangle') {
            for (let i = 0; i < 3; i++) {
                ctx.lineTo(this.pos.x + this.radius * Math.cos((i * 2 * Math.PI / 3) - Math.PI / 2),
                          this.pos.y + this.radius * Math.sin((i * 2 * Math.PI / 3) - Math.PI / 2));
            }
            ctx.closePath();
        } else if (this.shape === 'square') {
            ctx.rect(this.pos.x - this.radius, this.pos.y - this.radius, this.radius * 2, this.radius * 2);
        }
        const bodyIsLight = document.querySelector('body').classList.contains('light');
        ctx.fillStyle = bodyIsLight ? 'rgba(0,0,0,' + this.active + ')' : 'rgba(255,255,255,' + this.active + ')';
        ctx.fill();
    };
    this.update = function() {
        // Change shape occasionally
        if (Math.random() < 0.015) { // 0.5% chance to change shape on each frame
            const shapes = ['circle', 'triangle', 'square'];
            this.shape = shapes[Math.floor(Math.random() * shapes.length)];
        }
    };
  }

  function getDistance(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  }

  init();

// InputBar autofocus

  function forceFocus() {
    document.getElementById("search__input").focus();
  }

  forceFocus();
  setInterval(forceFocus, 100);//auto run function forceFocus every 100 ms

// InputBar Main Functions

  function removeDuplicateTerminalLines() {
    var seenTexts = new Set();
    $('.terminal__line').each(function() {
      var text = $(this).text();
      if (seenTexts.has(text)) {
        $(this).remove();
      } else {
        seenTexts.add(text);
      }
    });
  }

  function toggleTheme() {
    var body = document.querySelector('body');
    var search = document.querySelector('.search__input');
    if (body.classList.contains('light')) {
        body.classList.remove('light');
    } else {
        body.classList.add('light');
    }
    if (search.classList.contains('light')) {
      search.classList.remove('light');
    } else {
      search.classList.add('light');
    }
  }

  function IP() {
    var terminal_div = document.getElementsByClassName('terminal');
        $('.terminal').addClass("binding");
    var theipagain = $('#ip').html();
    var ipconfig = document.createElement('p');
          $(ipconfig).text('ipconfig: ' + theipagain);
          ipconfig.setAttribute('class', 'terminal__line');
          $(ipconfig).appendTo(terminal_div);
          console.log(ipconfig.length);
  }

// InputBar Commands

  ;(function(window) {
    'use strict';

    function getPublicIP(callback) { //FIND IP using api/site
        $.getJSON('https://api.ipify.org?format=json', function(data) {
            callback(data.ip);
        });
    }

    function addIP(ip) {
        console.log('got ip: ', ip);
        const theIp = document.getElementById('ip');
        const theConsole = document.querySelector('span.console');
        theIp.textContent = ip;
        theConsole.textContent = ip;
    }

    getPublicIP(addIP);
    $.getJSON('https://ipapi.co/'+$(ip).val()+'/json', function(data){
          $('.country').text(data.country);
      });
    (function() { //FIND LOCATION using api/site
      var theConsole = $('span.console');
      var texted = $("#ip").text();
      theConsole.html(texted);
    });

    var search_form = document.getElementsByClassName('search__form');
    $(search_form).submit(function( event ) {
      var binder = $('input').val();
      if (binder  === 'reboot') {
        location.reload();
      }
      else if (binder === 'github' || binder == 'gh') {
        window.open('https://github.com/X3ric');
      }
      else if (binder === 'archx' || binder == 'arch') {
        window.open('https://github.com/X3ric/ArchX');
      }
      else if (binder === 'usr' || binder == 'dotfiles') {
        window.open('https://github.com/X3ric/usr');
      }
      else if (binder === 'help') {
        const terminal_div = document.getElementsByClassName('terminal');
        $('.terminal').addClass("binding");
        var commandsList = `
          <p class='terminal__line'>Available Commands:</p>
          <p class="terminal__line"><a href="#" onclick="location.reload(); return false;">reboot</a>: Reloads the page.</p>
          <p class="terminal__line"><a href="https://github.com/X3ric">github/gh</a>: Opens GitHub page.</p>
          <p class="terminal__line"><a href="https://github.com/X3ric/ArchX">archx/arch</a>: Opens ArchX repository.</p>
          <p class="terminal__line"><a href="https://github.com/X3ric/usr">usr/dotfiles</a>: Opens usr repository.</p>
          <p class='terminal__line'><a href="#" onclick="IP(); return false;" >ip/ipconfig</a>: Shows your ip.</p>
          <p class='terminal__line'><a href="#" onclick="toggleTheme(); return false;" >theme</a>: Toggle theme.</p>
        `;
        $(commandsList).appendTo(terminal_div);
        event.preventDefault();
      }
      else if (binder === 'theme') {
        toggleTheme();
      }
      else if (binder === "ipconfig" || binder == "ip") {
        IP();
      }
      else {
        var htmlFileExists = false;
        function htmlpopup(htmlFile) {
            var homeDiv = document.createElement('div');
            homeDiv.setAttribute('class', 'home');
            fetch(htmlFile)
                .then(response => response.text())
                .then(htmlContent => {
                    homeDiv.innerHTML = '<div class="home_container">' + htmlContent + '<div class="close_home" href="">x</div></div>';
                    document.body.appendChild(homeDiv);
                    $('.close_home').click(function () {
                        $('.home').remove();
                    });
                })
                .catch(error => {
                    console.error('Error loading HTML file:', error);
                });
        }
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', binder + '.html', false);
          xhr.send();
          if (xhr.status === 200) {
            htmlFileExists = true;
          }
        } catch (e) {
          console.error('Error checking HTML file:', e);
        }
        if (htmlFileExists) {
          htmlpopup(binder + '.html');
        } else {
          const terminal_div = document.getElementsByClassName('terminal');
          $('.terminal').addClass("binding");
          var commands = document.createElement('p');
          commands.innerHTML = ('Execute: ' + binder);
          commands.setAttribute('class', 'terminal__line');
          $(commands).appendTo(terminal_div);
        }
        $('.search__input').val("");
        event.preventDefault();
      }
      var terminal_div = document.getElementsByClassName('terminal');
        $('.terminal').addClass("binding");
        var commands = document.createElement('p');
        commands.innerHTML = ('Execute: ' + binder);
        commands.setAttribute('class', 'terminal__line');
        $(commands).appendTo(terminal_div);
        $('.search__input').val("");
        removeDuplicateTerminalLines()
        event.preventDefault();
  });
  })(window);	

// Commands Autocompletion

  const commands = ['help', 'github', 'usr', 'dotfiles', 'arch', 'archx', 'theme', 'reload', 'gh', 'ip', 'ipconfig'];
  const inputElem = document.getElementById('search__input');
  const suggestionsElem = document.getElementById('autocomplete-suggestions');

  inputElem.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      let matches = commands.filter(cmd => cmd.startsWith(query));
      suggestionsElem.innerHTML = '';
      matches.forEach(cmd => {
          let div = document.createElement('div');
          div.classList.add('autocomplete-suggestion');
          div.textContent = cmd;
          div.addEventListener('click', function() {
              inputElem.value = cmd;
              suggestionsElem.innerHTML = '';  // clear suggestions
          });
          suggestionsElem.appendChild(div);
      });
  });

  document.body.addEventListener('click', function(e) {
      if (e.target !== inputElem && e.target !== suggestionsElem) {
          suggestionsElem.innerHTML = '';  // clear suggestions if click outside input
      }
  });
  let commandHistory = [];
  let currentCommandIndex = -1;
  let currentInput = "";
  $('.search__input').keydown(function(event) {
      if (event.keyCode === 13) {  // Enter key
          commandHistory.push($(this).val());
          currentCommandIndex = commandHistory.length;
          currentInput = "";
          $('#autocomplete-suggestions').empty();
          if (!expanding && !shrinking) { // Start expanding if not already in the process
              expanding = true;
          }
      } else if (event.keyCode === 38) {  // Arrow up key
          if (currentCommandIndex === commandHistory.length) {
              currentInput = $(this).val();
          }
          if (currentCommandIndex > 0) {
              currentCommandIndex--;
              $(this).val(commandHistory[currentCommandIndex]);
          }
          event.preventDefault();
      } else if (event.keyCode === 40) {  // Arrow down key
          if (currentCommandIndex < commandHistory.length - 1) {
              currentCommandIndex++;
              $(this).val(commandHistory[currentCommandIndex]);
          } else if (currentCommandIndex === commandHistory.length - 1) {
              currentCommandIndex++;
              $(this).val(currentInput);
          }
          event.preventDefault();
      } else if (event.keyCode === 9) {  // Tab key
          // If no suggestion is selected, select the first one. Otherwise, select the next one.
          var currentSelected = $('#autocomplete-suggestions .autocomplete-suggestion.selected');
          if (currentSelected.length === 0) {
              $('#autocomplete-suggestions .autocomplete-suggestion').first().addClass('selected');
              $(this).val($('#autocomplete-suggestions .autocomplete-suggestion.selected').text());
          } else {
              currentSelected.removeClass('selected');
              if (currentSelected.next().length === 0) {
                  // If it was the last suggestion, select the first one.
                  $('#autocomplete-suggestions .autocomplete-suggestion').first().addClass('selected');
              } else {
                  currentSelected.next().addClass('selected');
              }
              $(this).val($('#autocomplete-suggestions .autocomplete-suggestion.selected').text());
          }
          event.preventDefault();  // Prevent the default tab behavior (like changing focus)
      }
  });

// InputBar Theme Changer

  document.getElementById('themeToggle').addEventListener('click', function() {
    var body = document.querySelector('body');
    var search = document.querySelector('.search__input');
    if (body.classList.contains('light')) {
        body.classList.remove('light');
    } else {
        body.classList.add('light');
    }
    if (search.classList.contains('light')) {
      search.classList.remove('light');
    } else {
      search.classList.add('light');
    }
  });