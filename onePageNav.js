/**
 * @options
 * @param {string} selector - Should target "a" node elements e.g. ".main-nav a"
 * @param {string} navigationActiveClass - class that should be added on navigarion link when section reached
 * @param {string} articleActiveClass - class that should be added on section when section reached
 * @param {int} changeOffset - element distance from top in precents, to set next section as active (0-100)%
 * @param {boolean} classOnAnchorTag - class will be set at Anchors - default false
 * @param {boolean} firstLinkActive - if no section was reached, first link will gain class active ( better not to use with exact matching)
 * @param {boolean} activeClassesOnSections - if true, section reached will gain class active
 * @param {array} parentsObtainingActiveClass - array with selectors of closest(s) nodes, where class 'active' should be added or removed on change
 * @param {array} allowedPaths - List of paths, where script will be evaluated e.g ['', '/', '/start']
 * @param {array} onChange - array of functions, that should be fired on change fe. [function1, function2], function becomes two parameters: callback(activeArticle, previousArticle)
 */
class onePageNav {
    firstLinkActive;
    classOnAnchorTag;
    changeOffset;
    parentsObtainingActiveClass;
    activeClassesOnSections;
    showTestLine;
    allowedPaths = [];

    navigationActiveClass = "active";
    articleActiveClass = "active";

    previousArticle;
    currentArticle;

    linksInNav = [];
    articles = [];

    testLines = [];
    listeners = [];

    onChange = [];

    constructor({ selector = "nav a", firstLinkActive = false, classOnAnchorTag = true, changeOffset = 50, parentsObtainingActiveClass = [], activeClassesOnSections = false, showTestLine = false, allowedPaths = undefined, navigationActiveClass = "active", articleActiveClass = "active", onChange = [] } = {}) {
        this.linksInNav = [...document.querySelectorAll(selector)];

        if (!this.linksInNav.length) {
            console.error("No possible selectors were found. - `" + this.selector + "`");
            return;
        }

        this.firstLinkActive = firstLinkActive;
        this.classOnAnchorTag = classOnAnchorTag;
        this.changeOffset = changeOffset;
        this.parentsObtainingActiveClass = parentsObtainingActiveClass;
        this.activeClassesOnSections = activeClassesOnSections;
        this.showTestLine = showTestLine;
        this.allowedPaths = allowedPaths;
        this.navigationActiveClass = navigationActiveClass;
        this.articleActiveClass = articleActiveClass;
        this.onChange = onChange;

        this.handleFirstLinkActive(this.currentArticle);

        this.invoke();
    }

    set = (optionName, value) => {
        this[optionName] = value;
        this.invoke();
    };

    invoke = () => {
        // Initialisiert sich nur auf Hauptseite - es ist nicht ganz so gute Idee(/start, /startseite)
        if (this.allowedPaths && !this.allowedPaths.includes(document.location.pathname)) return;

        // Zieh raus Hashes gefunden bei links
        let hashes = this.linksInNav.map((el) => el.hash).filter((el) => el);

        // Suche nach alle Artikeln, die mit hashes stimmen
        this.articles = [...document.querySelectorAll(hashes.join(", "))];

        this.handleTestLine();

        // First initialize and scrolling function
        this.listeners.forEach((el) => {
            window.removeEventListener(el);
            console.log(el);
        });
        let listener = window.addEventListener("scroll", () => this.setClasses());
        this.listeners.push(listener);

        this.setClasses();
    };

    setClasses = () => {
        // Filter items above defined offset
        this.findCurrentArticle();

        // Continue on change only.
        if (this.currentArticleChanged()) {
            this.clearClasses();
            this.handleFirstLinkActive(this.currentArticle);

            this.handleCallbacks();

            if (this.currentArticle == undefined) return;

            this.handleArticleClasses();
            this.addActiveClassesOnNavigationLinks();
        }
    };

    findCurrentArticle() {
        this.previousArticle = this.currentArticle;
        this.currentArticle = this.articles.filter((el) => el.offsetTop < window.scrollY + window.innerHeight / (100 / this.changeOffset)).at(-1);
    }

    currentArticleChanged() {
        return this.currentArticle != this.previousArticle;
    }

    clearClasses() {
        this.linksInNav.forEach((link) => {
            this.removeActiveClass(link);
        });

        this.articles.forEach((el) => el.classList.remove("active"));
    }

    handleFirstLinkActive() {
        if (this.currentArticle == undefined && this.firstLinkActive) this.addActiveClass(this.linksInNav[0]);
    }

    handleArticleClasses() {
        if (this.activeClassesOnSections) this.currentArticle.classList.add("active");
    }

    addActiveClassesOnNavigationLinks() {
        let currentlyActiveLinks = this.findLinksWithHashEqualToCurrentArticleId(this.linksInNav, this.currentArticle.id);
        currentlyActiveLinks.forEach((activeLink) => this.addActiveClass(activeLink));
    }

    handleCallbacks() {
        this.onChange.forEach((callback) => {
            callback(this.currentArticle, this.previousArticle);
        });
    }

    removeActiveClass = (el) => {
        if (this.classOnAnchorTag) el.classList.remove("active");

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.remove("active");
        });
    };

    findLinksWithHashEqualToCurrentArticleId = (links, hash) => {
        return links.filter((el) => el.hash.includes(hash));
    };

    addActiveClass = (el) => {
        if (this.classOnAnchorTag) el.classList.add("active");

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.add("active");
        });
    };

    handleTestLine = () => {
        this.removeActualLines();
        if (this.showTestLine) this.createTestLine();
    };

    removeActualLines = () => {
        this.testLines.forEach((el) => el.remove());
    };

    createTestLine = () => {
        let testLine = document.createElement("div", { className: "testLine" });
        testLine.setAttribute("style", `position: fixed;width: 100%;background: red;height: 2px;top: calc(${this.changeOffset}% - 1px);`);
        this.testLines.push(testLine);
        document.body.appendChild(testLine);
    };
}
