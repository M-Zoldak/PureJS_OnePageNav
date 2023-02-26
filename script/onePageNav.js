/**
 * @options
 * @param {string} navLinksSelector - selector targeting anchor tags
 * @param {string} anchorActiveClass - class name that will be added on anchor when section reached and alternatively on parents passes inside parentsObtainingActiveClass
 * @param {string} sectionActiveClass - class name that will be added on section when reached
 * @param {string} defaultActiveElement - selector to element(e.g. <a> tag), which obtain class active, if none section was reached (or active if exact match option is used)
 * @param {int} changeOffset - the distance from the top of the page that the next element must be scrolled to in order to be activated. Value given in precents (0-100)% - default (50)
 * @param {boolean} updateATagClass - name of class that should be set on anchor elements and parents if given for parentsObtainingActiveClasses - default (true)
 * @param {boolean} defaultLinkActive - determines whether first link element should be set as active.(t/f) May be combined with exactMatch option and/or defaultActiveElement, to set another element instead of first link in array
 * @param {boolean} setClassesOnSections - if true, reached section becomes active class
 * @param {boolean} exactMatch - set class only if offset is located between begin and end of section, else change to undefined
 * @param {boolean} updateHash - update hash accordingly to section
 * @param {boolean} saveHashBetweenSections - hash won't change if there's a gap between sections - has only impact if exactMatch option is active
 * @param {array} parentsObtainingActiveClass - array of selectors for closest parent elements, where class 'active' should be added or removed when section changes
 * @param {array} allowedPaths - list of paths, where script will be evaluated e.g ['^/start/$'] for example.com/start. Function evaluated with function el.match(givenRegex);
 * @param {array} onChange - array of functions, that should be fired on change e.g. [function1, function2], callback receives whole onePageNav object. More can be found in github wiki
 * @param {boolean} debugLine - show debug line
 */
class onePageNav {
    // prettier-ignore
    constructor({ 
        navLinksSelector = "nav a", 
        defaultLinkActive = true, 
        updateATagClass = true, 
        changeOffset = 50, 
        parentsObtainingActiveClass = [], 
        setClassesOnSections = false, 
        exactMatch = false, 
        allowedPaths = undefined, 
        anchorActiveClass = "active", 
        sectionActiveClass = "active", 
        defaultActiveElement = undefined, 
        updateHash = false, 
        saveHashBetweenSections = true,
        debugLine = false, 
        onChange = [], 
    } = {}) {
            
        this.navLinksSelector = navLinksSelector;
        this.defaultLinkActive = defaultLinkActive;
        this.updateATagClass = updateATagClass;
        this.changeOffset = changeOffset;
        this.parentsObtainingActiveClass = parentsObtainingActiveClass;
        this.setClassesOnSections = setClassesOnSections;
        this.debugLine = debugLine;
        this.exactMatch = exactMatch;
        this.allowedPaths = allowedPaths;
        this.anchorActiveClass = anchorActiveClass;
        this.sectionActiveClass = sectionActiveClass;
        this.defaultActiveElement = defaultActiveElement;
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
        if (!this.navLinks) {
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
        this.navLinks = [...document.querySelectorAll(this.navLinksSelector)];
    };

    findRelatedSections = () => {
        let hashes = this.navLinks.map((el) => el.hash).filter((el) => el);
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
        this.navLinks.forEach((link) => {
            this.removeActiveClass(link);
        });

        this.sections.forEach((el) => {
            el.classList.remove(this.sectionActiveClass);
        });
    };

    handleDefaultLinkActive = () => {
        if (this.defaultActiveElement) {
            this.elementDefaultActive = document.querySelector(this.defaultActiveElement);
        }
        if (this.noSectionActive() && this.defaultLinkActive) {
            this.addActiveClass(this.elementDefaultActive ?? this.navLinks[0]);
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
            callback(this);
        });
    };

    handleSectionClasses = () => {
        if (this.setClassesOnSections) {
            this.currentSection.classList.add(this.sectionActiveClass);
        }
    };

    addActiveClassesOnNavigationLinks = () => {
        let currentlyActiveLinks = this.findLinksWithHashEqualTocurrentSectionId(this.navLinks, this.currentSection.id);
        currentlyActiveLinks.forEach((activeLink) => this.addActiveClass(activeLink));
    };

    findLinksWithHashEqualTocurrentSectionId = (links, hash) => {
        return links.filter((el) => el.hash.includes(hash));
    };

    addActiveClass = (el) => {
        if (this.updateATagClass) {
            el.classList.add(this.anchorActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            el.closest(parentSelector).classList.add(this.anchorActiveClass);
        });
    };

    removeActiveClass = (el) => {
        if (this.updateATagClass) {
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
