/**
 * @options
 * @param {string} navLinksSelector - selector targeting anchor tags
 * @param {string} elementDefaultActive - selector to element, which obtain class active, if none section was reached(or active in exact match)
 * @param {string} anchorActiveClass - class name that will be added on anchor when section reached and alternatively on parents passes inside parentsObtainingActiveClass
 * @param {string} sectionActiveClass - class name that will be added on section when reached
 * @param {int} changeOffset - the distance from the top of the page that the next element must be scrolled to in order to be activated. Value given in precents (0-100)% - default (50)
 * @param {boolean} classOnAnchorTag - name of class that should be set on anchor elements and parents if given for parentsObtainingActiveClasses - default (true)
 * @param {boolean} defaultLinkActive - determines whether first link element should be set as active.(t/f) May be combined with exact match option and/or element default active
 * @param {boolean} setClassesOnSections - if true, reached/active section will gain class active
 * @param {boolean} exactMatch - set class only if offset is located between begin and end of section
 * @param {boolean} updateHash - update hash accordingly to section
 * @param {boolean} saveHashBetweenSections - hash won't change if there's a gap between sections, and exact match is on
 * @param {array} parentsObtainingActiveClass - array of selectors for closest parent elements, where class 'active' should be added or removed when section changes
 * @param {array} allowedPaths - list of paths, where script will be evaluated e.g ['', '/', '/start'], currently only simple strings, default empty - evaluated on every site
 * @param {array} onChange - array of functions, that should be fired on change e.g. [function1, function2], callback function receives two parameters: callback(currentSection, previousSection)
 * @param {boolean} debugLine - show debug line
 */
class onePageNav {
    // prettier-ignore
    constructor({ 
        navLinksSelector = "nav a", 
        defaultLinkActive = true, 
        classOnAnchorTag = true, 
        changeOffset = 50, 
        parentsObtainingActiveClass = [], 
        setClassesOnSections = false, 
        debugLine = false, 
        exactMatch = false, 
        allowedPaths = undefined, 
        anchorActiveClass = "active", 
        sectionActiveClass = "active", 
        differentActiveAnchor = undefined, 
        updateHash = false, 
        saveHashBetweenSections = true,
        onChange = [], 
    } = {}) {
            
        this.navLinksSelector = navLinksSelector;
        this.defaultLinkActive = defaultLinkActive;
        this.classOnAnchorTag = classOnAnchorTag;
        this.changeOffset = changeOffset;
        this.parentsObtainingActiveClass = parentsObtainingActiveClass;
        this.setClassesOnSections = setClassesOnSections;
        this.debugLine = debugLine;
        this.exactMatch = exactMatch;
        this.allowedPaths = allowedPaths;
        this.anchorActiveClass = anchorActiveClass;
        this.sectionActiveClass = sectionActiveClass;
        this.differentActiveAnchor = differentActiveAnchor;
        this.updateHash = updateHash;
        this.onChange = onChange;
        this.saveHashBetweenSections = saveHashBetweenSections;

        this.sections = [];
        this.debugLines = [];

        this.initialize();
    }

    /**
     * @description use to change script behavior and initialize with new values
     * @param {string} option
     * @param {string} value
     */
    set = (option, value) => {
        this[option] = value;
        this.refresh();
    };

    /**
     * @description initializes values once again
     */
    refresh = () => {
        this.newlyInitialized = true;
        this.initialize();
    };

    initialize = () => {
        if (this.shouldTerminate()) return;

        this.findLinks();
        if (!this.linksInNav) {
            console.debug("The selector did not match any elements - `" + this.navLinksSelector + "`");
            return;
        }

        this.findRelatedSections();
        if (!this.sections) {
            console.debug("No sections found");
            return;
        }

        this.handleDebugLine();
        this.handleScrollListener();
        this.handleOutput();
    };

    shouldTerminate = () => {
        if (!this.allowedPaths) return false;

        let currentPath = document.location.pathname.trim();

        let pathMatchesAllowedPaths = this.allowedPaths.some((el) => currentPath.match(el.trim()));

        return !pathMatchesAllowedPaths;
    };

    findLinks = () => {
        this.linksInNav = [...document.querySelectorAll(this.navLinksSelector)];
    };

    findRelatedSections = () => {
        let hashes = this.linksInNav.map((el) => el.hash).filter((el) => el);
        this.sections = [...document.querySelectorAll(hashes.join(", "))];
    };

    handleScrollListener = () => {
        if (this.currentWindowScrollListener) {
            removeEventListener(scroll, this.currentWindowScrollListener);
        }
        this.currentWindowScrollListener = window.addEventListener("scroll", () => this.handleOutput());
    };

    handleOutput = () => {
        let foundSection = this.findCurrentSection();

        this.updateCurrentSection(foundSection);

        if (this.sectionChanged() || this.newlyInitialized) {
            this.newlyInitialized = false;

            this.clearClasses();
            this.handleDefaultLinkActive();

            this.handleHash();
            this.handleCallbacks();

            if (this.noSectionActive()) return;

            this.handleSectionClasses();
            this.addActiveClassesOnNavigationLinks();
        }
    };

    findCurrentSection = () => {
        return this.sections.filter((section) => this.isBelowSectionOffsetTop(section)).at(-1);
    };

    updateCurrentSection = (newSection) => {
        this.previousSection = this.currentSection;

        if (!this.exactMatch) {
            this.currentSection = newSection ?? this.handleDefaultLinkActive();
        } else {
            this.currentSection = this.isAboveSectionOffsetBottom(newSection) ? newSection : this.handleDefaultLinkActive();
        }
    };

    clearClasses = () => {
        this.linksInNav.forEach((link) => {
            this.removeActiveClass(link);
        });

        this.sections.forEach((el) => {
            el.classList.remove(this.sectionActiveClass);
        });
    };

    handleDefaultLinkActive = () => {
        if (this.differentActiveAnchor) {
            this.elementDefaultActive = document.querySelector(this.differentActiveAnchor);
        }
        if (this.noSectionActive() && this.defaultLinkActive) {
            this.addActiveClass(this.elementDefaultActive ?? this.linksInNav[0]);
        }
    };

    handleHash = () => {
        if (!this.updateHash) {
            return;
        } else if (this.exactMatch && !this.currentSection && this.saveHashBetweenSections && this.insideWorkingArea()) {
            let lastSectionAbove = this.findCurrentSection();
            history.pushState({}, "", lastSectionAbove ? "#" + lastSectionAbove.id : " ");
        } else {
            history.pushState({}, "", this.currentSection ? "#" + this.currentSection.id : " ");
        }
    };

    handleCallbacks = () => {
        this.onChange.forEach((callback) => {
            callback(this.currentSection, this.previousSection);
        });
    };

    handleSectionClasses = () => {
        if (this.setClassesOnSections) {
            this.currentSection.classList.add(this.sectionActiveClass);
        }
    };

    addActiveClassesOnNavigationLinks = () => {
        let currentlyActiveLinks = this.findLinksWithHashEqualTocurrentSectionId(this.linksInNav, this.currentSection.id);
        currentlyActiveLinks.forEach((activeLink) => this.addActiveClass(activeLink));
    };

    findLinksWithHashEqualTocurrentSectionId = (links, hash) => {
        return links.filter((el) => el.hash.includes(hash));
    };

    addActiveClass = (el) => {
        if (this.classOnAnchorTag) {
            el.classList.add(this.anchorActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.add(this.anchorActiveClass);
        });
    };

    removeActiveClass = (el) => {
        if (this.classOnAnchorTag) {
            el.classList.remove(this.anchorActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.remove(this.anchorActiveClass);
        });
    };

    sectionChanged = () => {
        return this.currentSection != this.previousSection;
    };

    noSectionActive = () => {
        return this.currentSection == undefined;
    };

    currentOffset = () => {
        return window.scrollY + window.innerHeight / (100 / this.changeOffset);
    };

    insideWorkingArea = () => {
        return this.currentOffset() > this.sections.at(0).offsetTop;
    };

    isExactlyInsideSection = (section) => {
        return this.isBelowSectionOffsetTop(section) && this.isAboveSectionOffsetBottom(section);
    };

    isAboveSectionOffsetTop = (section) => {
        if (!section) {
            return false;
        }
        return this.currentOffset() < section.offsetTop;
    };

    isAboveSectionOffsetBottom = (section) => {
        if (!section) {
            return false;
        }
        return this.currentOffset() < section.offsetTop + section.offsetHeight;
    };

    isBelowSectionOffsetTop = (section) => {
        if (!section) {
            return false;
        }
        return this.currentOffset() > section.offsetTop;
    };

    isBelowSectionOffsetBottom = (section) => {
        if (!section) {
            return false;
        }
        return this.currentOffset() > section.offsetTop + section.offsetHeight;
    };

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
