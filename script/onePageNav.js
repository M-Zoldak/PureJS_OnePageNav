/**
 * @options
 * @param {string} navLinksSelector - selector targeting anchor tags
 * @param {string} anchorActiveClass - class name that will be added on anchor when section reached and alternatively on parents passes inside parentsObtainingActiveClass
 * @param {string} sectionActiveClass - class name that will be added on section when reached
 * @param {string} defaultActiveElement - selector to element(e.g. `<a>` tag), which obtain class active, if none section was reached (or active if exact match option is used)
 * @param {int} changeOffset - the distance from the top of the page that the next element must be scrolled to in order to be activated. Value given in precents (0-100)% - default (50)
 * @param {boolean} updateATagClass - determines if class should be added to `<a>` tag
 * @param {boolean} defaultLinkActive - indicates whether first link element should be set as active. May be combined with exactMatch option and/or defaultActiveElement, to set another element instead of first link in array
 * @param {boolean} setClassesOnSections - if true, reached section becomes active class
 * @param {boolean} exactMatch - set class only if offset is located between begin and end of section, else change to undefined
 * @param {boolean} updateHash - update hash accordingly to section
 * @param {boolean} saveHashBetweenSections - hash won't change if there's a gap between sections - has only impact if exactMatch option is active
 * @param {array} parentsObtainingActiveClass - array of selectors for closest parent elements, where class 'active' should be added or removed when section changes
 * @param {array} allowedPaths - list of paths, where script will be evaluated e.g `['^/start/$']` for `example.com/start/`.
 * @param {array} onInit - array with functions, that should be fired after script was fully initialized e.g. `onInit: [function1, function2]`, callback receives whole onePageNav object.
 * @param {array} onChange - array with functions, that should be fired on change e.g. `onChange: [function1, function2]`, callback receives whole onePageNav object.
 * @param {boolean} debugLine - show debug line
 *
 * @link More about script can be found at https://github.com/Matheoz-sys/PureJS_onePageNav/wiki/About
 *
 * @copyright Copyright (c) 2023 Mateusz Żołdak
 * @license licensed under MIT license
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
        onInit = [], 
        onChange = [], 
        debugLine = false, 
    } = {}) {
        this.navLinksSelector = navLinksSelector;
        this.defaultLinkActive = defaultLinkActive;
        this.updateATagClass = updateATagClass;
        this.changeOffset = changeOffset;
        this.parentsObtainingActiveClass = parentsObtainingActiveClass;
        this.setClassesOnSections = setClassesOnSections;
        this.exactMatch = exactMatch;
        this.allowedPaths = allowedPaths;
        this.anchorActiveClass = anchorActiveClass;
        this.sectionActiveClass = sectionActiveClass;
        this.defaultActiveElement = defaultActiveElement;
        this.updateHash = updateHash;
        this.saveHashBetweenSections = saveHashBetweenSections;
        this.onInit = onInit;
        this.onChange = onChange;
        this.showDebugLine = debugLine;
        this.debugLine = undefined;
        this.sections = [];
        this.that = this;

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
            // return;
        }

        this.findElementDefaultActive();
        this.handleDebugLine();
        this.handleScrollListener();
        this.handleOutput();
        this.handleOnInitCallbacks();
    };

    shouldTerminate = () => {
        return this.isInAllowedPaths();
    };

    isInAllowedPaths = () => {
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
        window.removeEventListener(scroll, this.handleOutput);
        window.addEventListener("scroll", this.handleOutput);
    };

    handleOutput = () => {
        this.updateCurrentSection(this.findCurrentSection());

        if (Section.hasChanged(this) || this.newlyInitialized) {
            this.newlyInitialized = false;

            this.clearClasses();
            this.handleDefaultLinkActive();
            this.handleHash();

            if (!Section.noneActive(this)) this.handleOnChangeCallbacks();

            if (Section.noneActive(this)) return;

            this.handleSectionClasses();
            this.addActiveClassesOnNavigationLinks();
            this.handleOnChangeCallbacks();
        }
    };

    firstSectionAbove = () => {
        return this.sections.filter((section) => Offset.belowSectionOffsetTop(this, section)).at(-1);
    };

    findCurrentSection = () => {
        if (this.exactMatch) return this.sections.filter((section) => Offset.exactlyInsideSection(this, section)).at(-1);
        else return this.firstSectionAbove();
    };

    updateCurrentSection = (newSection) => {
        this.previousSection = this.currentSection;

        this.currentSection = newSection ?? this.handleDefaultLinkActive();
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
        if (Section.noneActive(this) && this.defaultLinkActive) {
            this.addActiveClass(this.elementDefaultActive ?? this.navLinks[0]);
        }
    };

    handleHash = () => {
        if (!this.updateHash) return;

        if (this.exactMatch && Section.noneActive(this) && this.saveHashBetweenSections && Offset.passedBeginningOfFirstSection(this)) {
            let lastSectionAbove = this.firstSectionAbove();
            history.replaceState(null, null, lastSectionAbove ? "#" + lastSectionAbove.id : " ");
        } else {
            history.replaceState(null, null, this.currentSection ? "#" + this.currentSection.id : " ");
        }
    };

    handleSectionClasses = () => {
        if (this.setClassesOnSections) {
            this.currentSection.classList.add(this.sectionActiveClass);
        }
    };

    addActiveClassesOnNavigationLinks = () => {
        let currentlyActiveLinks = this.allLinksIncludingHash(this.navLinks, this.currentSection.id);
        currentlyActiveLinks.forEach((activeLink) => this.addActiveClass(activeLink));
    };

    allLinksIncludingHash = (links, hash) => {
        return links.filter((link) => link.hash == `#${hash}`);
    };

    addActiveClass = (aElement) => {
        if (this.updateATagClass) {
            aElement.classList.add(this.anchorActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            aElement.closest(parentSelector).classList.add(this.anchorActiveClass);
        });
    };

    removeActiveClass = (aElement) => {
        if (this.updateATagClass) {
            aElement.classList.remove(this.anchorActiveClass);
        }

        this.parentsObtainingActiveClass.forEach((parentSelector) => {
            aElement.closest(parentSelector).classList.remove(this.anchorActiveClass);
        });
    };

    findElementDefaultActive = () => {
        try {
            this.elementDefaultActive = document.querySelector(this.defaultActiveElement);
        } catch {
            this.elementDefaultActive = undefined;
            console.debug("Default active element not found.");
        }
    };

    handleOnInitCallbacks = () => {
        this.onChange.forEach((callback) => {
            callback(this);
        });
    };

    handleOnChangeCallbacks = () => {
        this.onChange.forEach((callback) => {
            callback(this);
        });
    };

    handleDebugLine = () => {
        if (!this.debugLine) this.debugLine = new DebugLine(this);
        this.debugLine.update(this);
    };
}

class Offset {
    static position = ({ changeOffset }) => {
        return window.scrollY + window.innerHeight / (100 / changeOffset);
    };

    static belowSection = (pageNavObj, section) => {
        if (!Section.exist(section)) return false;
        return this.position(pageNavObj) > this.posYFromPageTop(section) + section.offsetHeight;
    };

    static belowSectionOffsetTop = (pageNavObj, section) => {
        if (!Section.exist(section)) return false;
        return this.position(pageNavObj) > this.posYFromPageTop(section);
    };

    static aboveSection = (pageNavObj, section) => {
        if (!Section.exist(section)) return false;
        return this.position(pageNavObj) < this.posYFromPageTop(section);
    };

    static aboveSectionOffsetBottom = (pageNavObj, section) => {
        if (!Section.exist(section)) return false;
        return this.position(pageNavObj) < this.posYFromPageTop(section) + section.offsetHeight;
    };

    static passedBeginningOfFirstSection = (pageNavObj) => {
        return this.position(pageNavObj) > pageNavObj.sections.at(0).getBoundingClientRect().top + document.documentElement.scrollTop;
    };

    static exactlyInsideSection = (pageNavObj, section) => {
        return this.belowSectionOffsetTop(pageNavObj, section) && this.aboveSectionOffsetBottom(pageNavObj, section);
    };

    static posYFromPageTop = (section) => {
        return section.getBoundingClientRect().top + document.documentElement.scrollTop;
    };
}

class Section {
    static exist = (section) => {
        return section ? true : false;
    };

    static hasChanged = ({ currentSection, previousSection }) => {
        return currentSection != previousSection;
    };

    static noneActive = ({ currentSection }) => {
        return currentSection == undefined;
    };
}

class DebugLine {
    constructor(onePageNav) {
        this.update(onePageNav);
    }

    update({ showDebugLine, changeOffset }) {
        if (showDebugLine) {
            this.debugLine ? this.updateOffset(changeOffset) : this.create();
        } else {
            this.remove();
        }
    }

    updateOffset = (changeOffset) => {
        this.debugLine.style.top = `calc(${changeOffset}% - 2px)`;
    };

    create = () => {
        this.debugLine = document.createElement("div");
        this.debugLine.classList.add("debugLine");
        this.debugLine.setAttribute("style", `position: fixed;width: 100%;background: #ff00007a;height: 4px;transition: .6s; top:50%;`);
        document.body.appendChild(this.debugLine);
    };

    remove = () => {
        if (this.debugLine) {
            this.debugLine.remove();
            this.debugLine = undefined;
        }
    };
}
