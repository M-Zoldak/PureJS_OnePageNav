/**
 * @options
 * @param {string} selector - Should target "a" node elements e.g. ".main-nav a"
 * @param {string} defaultActiveAnchor - Should target link which gains class Active if none section reached
 * @param {string} navigationActiveClass - class that should be added on navigarion link when section reached
 * @param {string} articleActiveClass - class that should be added on section when section reached
 * @param {int} changeOffset - element distance from top in precents, to set next section as active (0-100)%
 * @param {boolean} classOnAnchorTag - class will be set at Anchors - default false
 * @param {boolean} defaultLinkActive - if no section was reached, default settet or first link will gain class active - should be off with exact matching
 * @param {boolean} setClassesOnSections - if true, section reached will gain class active
 * @param {boolean} exactMatch - set class only if offset place is between begin and end of section
 * @param {array} parentsObtainingActiveClass - array with selectors of closest(s) nodes, where class 'active' should be added or removed on change
 * @param {array} allowedPaths - List of paths, where script will be evaluated e.g ['', '/', '/start']
 * @param {array} onChange - array of functions, that should be fired on change fe. [function1, function2], function becomes two parameters: callback(activeArticle, previousArticle)
 */
class onePageNav {
    defaultLinkActive;
    classOnAnchorTag;
    changeOffset;
    parentsObtainingActiveClass;
    setClassesOnSections;
    showTestLine;
    exactMatch;
    allowedPaths;
    defaultActiveAnchor;

    navigationActiveClass;
    articleActiveClass;

    previousArticle;
    currentArticle;

    linksInNav = [];
    articles = [];

    testLines = [];
    listeners = [];

    onChange = [];

    constructor({ selector = "nav a", defaultLinkActive = false, classOnAnchorTag = true, changeOffset = 50, parentsObtainingActiveClass = [], setClassesOnSections = false, showTestLine = false, exactMatch = false, allowedPaths = undefined, navigationActiveClass = "active", articleActiveClass = "active", onChange = [], defaultActiveAnchor = undefined } = {}) {
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
        this.showTestLine = showTestLine;
        this.exactMatch = exactMatch;
        this.allowedPaths = allowedPaths;
        this.navigationActiveClass = navigationActiveClass;
        this.articleActiveClass = articleActiveClass;
        this.defaultActiveAnchor = document.querySelector(defaultActiveAnchor);
        this.onChange = onChange;

        this.invoke();
    }

    set = (optionName, value) => {
        this[optionName] = value;
        this.invoke();
    };

    invoke = () => {
        // Initialisiert sich nur auf Hauptseite - es ist nicht ganz so gute Idee(/start, /startseite)
        if (this.allowedPaths && !this.allowedPaths.includes(document.location.pathname)) return;

        this.handleDefaultLinkActive(this.currentArticle);

        this.articles = this.findRelatedArticles();
        if (!this.articles.length) {
            console.warn("No sections found");
            return;
        }

        this.handleTestLine();

        // First initialize and scrolling function
        this.listeners.forEach((el) => {
            console.log(el);
            removeEventListener(scroll, el);
        });
        let listener = window.addEventListener("scroll", () => this.handleOutput());
        this.listeners.push(listener);

        this.handleOutput();
    };

    findRelatedArticles = () => {
        let hashes = this.linksInNav.map((el) => el.hash).filter((el) => el);
        return [...document.querySelectorAll(hashes.join(", "))];
    };

    handleOutput = () => {
        this.findCurrentArticle();

        if (this.articleChanged()) {
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

    articleChanged() {
        return this.currentArticle != this.previousArticle;
    }

    clearClasses() {
        this.linksInNav.forEach((link) => {
            this.removeActiveClass(link);
        });

        this.articles.forEach((el) => {
            el.classList.remove(this.articleActiveClass);
        });
    }

    removeActiveClass = (el) => {
        if (this.classOnAnchorTag) {
            el.classList.remove(this.navigationActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.remove(this.navigationActiveClass);
        });
    };

    handleDefaultLinkActive() {
        if (this.currentArticle == undefined && this.defaultLinkActive) {
            console.log(this.defaultActiveAnchor);

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

    handleTestLine = () => {
        this.testLines.forEach((el) => el.remove());
        if (this.showTestLine) this.createTestLine();
    };

    createTestLine = () => {
        let testLine = document.createElement("div", { className: "testLine" });
        testLine.setAttribute("style", `position: fixed;width: 100%;background: red;height: 2px;top: calc(${this.changeOffset}% - 1px);`);
        this.testLines.push(testLine);
        document.body.appendChild(testLine);
    };
}
