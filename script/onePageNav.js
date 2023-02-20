/**
 * @options
 * @param {string} selector - Should target navigation "a" node elements e.g. ".main-nav a"
 * @param {string} defaultActiveAnchor - Should target link which will gain class Active if none section reached / active in exactMatch
 * @param {string} navigationActiveClass - class that should be added on anchor when section reached
 * @param {string} articleActiveClass - class that should be added on section when reached
 * @param {int} changeOffset -distance from top to be reached through next element to change active item. Value given in precents (0-100)% - default (50)
 * @param {boolean} classOnAnchorTag - class will be set at Anchors - default (true)
 * @param {boolean} defaultLinkActive - if no section was reached, default settet at defaultActiveAnchor or first link from list will gain class active
 * @param {boolean} setClassesOnSections - if true, reached/active section will gain class active
 * @param {boolean} exactMatch - set class only if offset place is between begin and end of section else default link or none
 * @param {array} parentsObtainingActiveClass - array with selectors of closest(selector) nodes, where class 'active' should be added or removed on change
 * @param {array} allowedPaths - List of paths, where script will be evaluated e.g ['', '/', '/start'], default empty - evaluated on every site
 * @param {array} onChange - array of functions, that should be fired on change fe. [function1, function2], function becomes two parameters: callback(activeArticle, previousArticle)
 * @param {boolean} debugLine - debug line
 */
class onePageNav {
    defaultLinkActive;
    defaultActiveAnchor;
    differentActiveAnchor;
    classOnAnchorTag;
    changeOffset;
    parentsObtainingActiveClass;
    setClassesOnSections;
    exactMatch;
    allowedPaths;
    debugLine;

    navigationActiveClass;
    articleActiveClass;

    previousArticle;
    currentArticle;

    linksInNav;
    articles;

    debugLines;
    currentWindowScrollListener;

    onChange;

    constructor({ selector = "nav a", defaultLinkActive = true, classOnAnchorTag = true, changeOffset = 50, parentsObtainingActiveClass = [], setClassesOnSections = false, debugLine = false, exactMatch = false, allowedPaths = undefined, navigationActiveClass = "active", articleActiveClass = "active", onChange = [], differentActiveAnchor = undefined } = {}) {
        this.linksInNav = [...document.querySelectorAll(selector)];

        if (!this.linksInNav.length) {
            console.error("No possible selectors were found. - `" + this.selector + "`");
            return;
        }

        this.defaultLinkActive = defaultLinkActive;
        this.classOnAnchorTag = classOnAnchorTag;
        this.changeOffset = changeOffset;
        this.parentsObtainingActiveClass = parentsObtainingActiveClass;
        this.setClassesOnSections = setClassesOnSections;
        this.debugLine = debugLine;
        this.exactMatch = exactMatch;
        this.allowedPaths = allowedPaths;
        this.navigationActiveClass = navigationActiveClass;
        this.articleActiveClass = articleActiveClass;
        this.differentActiveAnchor = differentActiveAnchor;
        this.onChange = onChange;

        this.articles = [];
        this.debugLines = [];

        this.invoke();
    }

    set = (optionName, value) => {
        this[optionName] = value;
        this.newlyInitialized = true;
        this.invoke();
    };

    invoke = () => {
        // Initialisiert sich nur auf Hauptseite - es ist nicht ganz so gute Idee(/start, /startseite)
        if (this.allowedPaths && !this.allowedPaths.includes(document.location.pathname)) return;

        this.handleDefaultLinkActive();

        this.articles = this.findRelatedArticles();
        if (!this.articles.length) {
            console.warn("No sections found");
            return;
        }

        this.handleDebugLine();
        this.handleScrollListener();
        this.handleOutput();
    };

    findRelatedArticles = () => {
        let hashes = this.linksInNav.map((el) => el.hash).filter((el) => el);
        return [...document.querySelectorAll(hashes.join(", "))];
    };

    handleScrollListener = () => {
        if (this.currentWindowScrollListener) {
            removeEventListener(scroll, this.currentWindowScrollListener);
        }
        this.currentWindowScrollListener = window.addEventListener("scroll", () => this.handleOutput());
    };

    handleOutput = () => {
        this.findCurrentArticle();

        if (this.articleChanged() || this.newlyInitialized) {
            this.newlyInitialized = false;

            this.clearClasses();
            this.handleDefaultLinkActive();

            this.handleCallbacks();

            if (this.currentArticle == undefined) return;

            this.handleArticleClasses();
            this.addActiveClassesOnNavigationLinks();
        }
    };

    findCurrentArticle() {
        this.previousArticle = this.currentArticle;
        let tempCurrent = this.articles.filter((el) => el.offsetTop < window.scrollY + window.innerHeight / (100 / this.changeOffset)).at(-1);

        if (!this.exactMatch) this.currentArticle = tempCurrent;
        else if (tempCurrent) {
            this.currentArticle = tempCurrent.offsetHeight + tempCurrent.offsetTop > window.scrollY + window.innerHeight / (100 / this.changeOffset) ? tempCurrent : this.handleDefaultLinkActive();
        } else {
            this.currentArticle = undefined;
        }
    }

    clearClasses() {
        this.linksInNav.forEach((link) => {
            this.removeActiveClass(link);
        });

        this.articles.forEach((el) => {
            el.classList.remove(this.articleActiveClass);
        });
    }

    handleDefaultLinkActive() {
        if (this.differentActiveAnchor) this.defaultActiveAnchor = document.querySelector(this.differentActiveAnchor);
        if (this.currentArticle == undefined && this.defaultLinkActive) {
            this.addActiveClass(this.defaultActiveAnchor ?? this.linksInNav[0]);
        }
    }

    handleCallbacks() {
        this.onChange.forEach((callback) => {
            callback(this.currentArticle, this.previousArticle);
        });
    }

    handleArticleClasses() {
        if (this.setClassesOnSections) {
            this.currentArticle.classList.add(this.articleActiveClass);
        }
    }

    addActiveClassesOnNavigationLinks() {
        let currentlyActiveLinks = this.findLinksWithHashEqualToCurrentArticleId(this.linksInNav, this.currentArticle.id);
        currentlyActiveLinks.forEach((activeLink) => this.addActiveClass(activeLink));
    }

    findLinksWithHashEqualToCurrentArticleId = (links, hash) => {
        return links.filter((el) => el.hash.includes(hash));
    };

    addActiveClass = (el) => {
        if (this.classOnAnchorTag) {
            el.classList.add(this.navigationActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.add(this.navigationActiveClass);
        });
    };

    removeActiveClass = (el) => {
        if (this.classOnAnchorTag) {
            el.classList.remove(this.navigationActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.remove(this.navigationActiveClass);
        });
    };

    articleChanged() {
        return this.currentArticle != this.previousArticle;
    }

    handleDebugLine = () => {
        this.debugLines.forEach((el) => el.remove());
        if (this.debugLine) this.createDebugLine();
    };

    createDebugLine = () => {
        let debugLine = document.createElement("div");
        debugLine.setAttribute("style", `position: fixed;width: 100%;background: red;height: 2px;top: calc(${this.changeOffset}% - 1px);`);
        this.debugLines.push(debugLine);
        document.body.appendChild(debugLine);
    };
}
