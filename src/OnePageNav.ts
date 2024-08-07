type OnePageNavOptions = {
    [key: string]: any;
    navLinksSelector?: string;
    navLinkActiveClass?: string;
    sectionActiveClass?: string;
    defaultActiveElement?: string;
    changeOffset?: number;
    defaultLinkActive?: boolean;
    updateATagClass?: boolean;
    setClassesOnSections?: boolean;
    exactMatch?: boolean;
    updateHash?: boolean;
    saveHashBetweenSections?: boolean;
    parentsObtainingActiveClass?: Array<string>;
    onInit?: Array<Function>;
    onChange?: Array<Function>;
    debugLine?: boolean;
};

interface OnePageNavInterface {
    options: OnePageNavOptions;
}

/**
 * @param {string} navLinksSelector - selector targeting anchor tags
 * @options
 * @param {string} navLinkActiveClass - class name that will be added on navigation link when section reached and alternatively on parents passes inside parentsObtainingActiveClass
 * @param {string} sectionActiveClass - class name that will be added on section when reached
 * @param {string} defaultActiveElement - selector to element(e.g. `<a>` tag), which obtain class active, if none section was reached (or active if exact match option is used)
 * @param {int} changeOffset - the distance from the top of the page that the next element must be scrolled to in order to be activated. Value given in precents (0-100)% - default (50)
 * @param {boolean} defaultLinkActive - indicates whether first link element should be set as active. May be combined with exactMatch option and/or defaultActiveElement, to set another element instead of first link in array
 * @param {boolean} updateATagClass - determines if class should be added to `<a>` tag
 * @param {boolean} setClassesOnSections - if true, reached section becomes active class
 * @param {boolean} exactMatch - set class only if offset is located between begin and end of section, else change to undefined
 * @param {boolean} updateHash - update hash accordingly to section
 * @param {boolean} saveHashBetweenSections - hash won't change if there's a gap between sections - has only impact if exactMatch option is active
 * @param {array} parentsObtainingActiveClass - array of selectors for closest parent elements, where class 'active' should be added or removed when section changes
 * @param {array} onInit - array with functions, that should be fired after script was fully initialized e.g. `onInit: [function1, function2]`, callback receives whole onePageNav object.
 * @param {array} onChange - array with functions, that should be fired on change e.g. `onChange: [function1, function2]`, callback receives whole onePageNav object.
 * @param {boolean} debugLine - show debug line
 *
 * @link More about script - https://github.com/Matheoz-sys/PureJS_OnePageNav/
 *
 * @copyright Copyright (c) 2023 Mateusz Żołdak
 * @license licensed under MIT license
 */

let defaults = {
    navLinksSelector: 'nav a',
    defaultLinkActive: true,
    updateATagClass: true,
    changeOffset: 50,
    parentsObtainingActiveClass: [],
    setClassesOnSections: false,
    exactMatch: false,
    navLinkActiveClass: 'active',
    sectionActiveClass: 'active',
    defaultActiveElement: undefined,
    updateHash: false,
    saveHashBetweenSections: true,
    onInit: [],
    onChange: [],
    debugLine: false,
};

class OnePageNav implements OnePageNavInterface {
    public previousSection: HTMLElement | undefined;
    public currentSection: HTMLElement | undefined;
    public sections: Array<HTMLElement>;
    public options: OnePageNavOptions;
    private elementDefaultActive?: HTMLElement;
    private newlyInitialized: boolean;
    private navLinks: Array<HTMLAnchorElement>;
    private debugLine?: DebugLine;

    constructor(options: OnePageNavOptions = defaults) {
        if (options) {
            options = Object.fromEntries(
                Object.entries(options).filter(([value]) => value != undefined)
            );
        }

        this.options = Object.assign({}, defaults, options);
        this.initialize();
    }

    /**
     * @description use to change script behavior and initialize with new values
     * @param {string} key
     * @param {string} value
     */
    set = (key: string, value: any): void => {
        console.log(key, value);
        this.options[key] = value;
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
        if (!this.options.navLinksSelector)
            throw new Error(
                `navLinks selector has to be not empty string value! Current value: '${this.options.navLinksSelector}'`
            );
        this.findLinks(this.options.navLinksSelector);

        // TODO Resolve Errors output
        if (!this.navLinks) {
            console.debug(
                'The selector did not match any elements - `' + this.options.navLinksSelector + '`'
            );
            return;
        }

        this.findRelatedSections();

        if (!this.sections) {
            console.debug('No sections found');
        } else {
            this.findElementDefaultActive();
            this.handleDebugLine();
            this.handleScrollListener();
            this.handleOutput();
            this.handleOnInitCallbacks();
        }
    };

    findLinks = (selector: string) => {
        this.navLinks = [...document.querySelectorAll(selector)] as HTMLAnchorElement[];
    };

    findRelatedSections = () => {
        let hashes = this.navLinks.map((el) => el.hash).filter((el) => el);

        if (hashes.length) {
            this.sections = [...document.querySelectorAll(hashes.join(', '))] as HTMLElement[];
        }
    };

    handleScrollListener = () => {
        window.removeEventListener('scroll', this.handleOutput);
        window.addEventListener('scroll', this.handleOutput);
    };

    handleOutput = () => {
        let currentSection = this.findCurrentSection();
        this.updateCurrentSection(currentSection);

        if (Section.hasChanged(this) || this.newlyInitialized) {
            this.newlyInitialized = false;

            this.clearClasses();
            if (this.options.defaultLinkActive) this.handleDefaultLinkActive();
            this.handleHash();

            if (!Section.noneActive(this)) this.handleOnChangeCallbacks();

            if (Section.noneActive(this)) return;

            this.handleSectionClasses();
            this.addActiveClassesOnNavigationLinks();
            this.handleOnChangeCallbacks();
        }
    };

    firstSectionAbove = () => {
        return this.sections
            .filter((section) => Offset.belowSectionOffsetTop(this, section))
            .at(-1);
    };

    findCurrentSection = () => {
        if (this.options.exactMatch)
            return this.sections
                .filter((section) => Offset.exactlyInsideSection(this, section))
                .at(-1);
        else return this.firstSectionAbove();
    };

    updateCurrentSection = (newSection: Element | undefined) => {
        this.previousSection = this.currentSection;
        this.currentSection = (newSection as HTMLElement) ?? this.handleDefaultLinkActive();
    };

    clearClasses = () => {
        this.navLinks.forEach((link) => {
            this.removeActiveClass(link);
        });

        this.sections.forEach((el) => {
            el.classList.remove(this.options.sectionActiveClass ?? 'active');
        });
    };

    handleDefaultLinkActive = () => {
        if (Section.noneActive(this) && this.options.defaultLinkActive) {
            this.addActiveClass(this.elementDefaultActive ?? this.navLinks[0]);
        }
    };

    handleHash = () => {
        if (!this.options.updateHash) return;

        if (
            this.options.exactMatch &&
            Section.noneActive(this) &&
            this.options.saveHashBetweenSections &&
            Offset.passedBeginningOfFirstSection(this)
        ) {
            let lastSectionAbove = this.firstSectionAbove();
            history.replaceState(null, '', lastSectionAbove ? '#' + lastSectionAbove.id : ' ');
        } else {
            history.replaceState(
                null,
                '',
                this.currentSection ? '#' + this.currentSection.id : ' '
            );
        }
    };

    handleSectionClasses = () => {
        if (this.options.setClassesOnSections && this.currentSection) {
            this.currentSection.classList.add(
                this.options.sectionActiveClass ?? defaults.sectionActiveClass
            );
        }
    };

    addActiveClassesOnNavigationLinks = () => {
        if (!this.currentSection) return;
        let currentlyActiveLinks = this.allLinksIncludingHash(
            this.navLinks,
            this.currentSection.id
        );

        currentlyActiveLinks.forEach((activeLink: HTMLAnchorElement) =>
            this.addActiveClass(activeLink)
        );
    };

    allLinksIncludingHash = (links: Array<HTMLAnchorElement>, hash: string) => {
        return links.filter((link) => link.hash == `#${hash}`);
    };

    addActiveClass = (aElement: HTMLElement) => {
        if (this.options.updateATagClass) {
            aElement.classList.add(this.options.navLinkActiveClass ?? 'active');
        }

        this.options.parentsObtainingActiveClass?.forEach((parentSelector: string) => {
            aElement
                .closest(parentSelector)
                ?.classList.add(this.options.navLinkActiveClass ?? 'active');
        });
    };

    removeActiveClass = (aElement: HTMLElement) => {
        if (this.options.updateATagClass) {
            aElement.classList.remove(this.options.navLinkActiveClass ?? 'active');
        }

        this.options.parentsObtainingActiveClass?.forEach((parentSelector: string) => {
            aElement
                .closest(parentSelector)
                ?.classList.remove(this.options.navLinkActiveClass ?? 'active');
        });
    };

    findElementDefaultActive = () => {
        if (this.options.defaultActiveElement) {
            this.elementDefaultActive = document.querySelector(
                this.options.defaultActiveElement
            ) as HTMLElement;
        } else {
            this.elementDefaultActive = undefined;
        }
    };

    handleOnInitCallbacks = () => {
        this.options.onChange?.forEach((callback) => {
            callback(this);
        });
    };

    handleOnChangeCallbacks = () => {
        this.options.onChange?.forEach((callback) => {
            callback(this);
        });
    };

    handleDebugLine = () => {
        console.log(this.debugLine);
        if (!this.debugLine) this.debugLine = new DebugLine(this);
        this.debugLine.update(this.options);
    };
}

class Offset {
    static position = ({ changeOffset = 50 }: OnePageNavOptions) => {
        return window.scrollY + window.innerHeight / (100 / changeOffset);
    };

    static belowSection = (pageNavObj: OnePageNav, section: HTMLElement) => {
        if (!Section.exist(section)) return false;
        return (
            this.position(pageNavObj.options) > this.posYFromPageTop(section) + section.offsetHeight
        );
    };

    static belowSectionOffsetTop = (pageNavObj: OnePageNav, section: HTMLElement) => {
        if (!Section.exist(section)) return false;
        return this.position(pageNavObj.options) > this.posYFromPageTop(section);
    };

    static aboveSection = (pageNavObj: OnePageNav, section: HTMLElement) => {
        if (!Section.exist(section)) return false;
        return this.position(pageNavObj.options) < this.posYFromPageTop(section);
    };

    static aboveSectionOffsetBottom = (pageNavObj: OnePageNav, section: HTMLElement) => {
        if (!Section.exist(section)) return false;
        return (
            this.position(pageNavObj.options) < this.posYFromPageTop(section) + section.offsetHeight
        );
    };

    static passedBeginningOfFirstSection = (pageNavObj: OnePageNav) => {
        return (
            this.position(pageNavObj.options) >
            pageNavObj.sections.at(0)!.getBoundingClientRect().top +
                document.documentElement.scrollTop
        );
    };

    static exactlyInsideSection = (pageNavObj: OnePageNav, section: HTMLElement) => {
        return (
            this.belowSectionOffsetTop(pageNavObj, section) &&
            this.aboveSectionOffsetBottom(pageNavObj, section)
        );
    };

    static posYFromPageTop = (section: HTMLElement) => {
        return section.getBoundingClientRect().top + document.documentElement.scrollTop;
    };
}

class Section {
    static exist = (section: HTMLElement) => {
        return section ? true : false;
    };

    static hasChanged = ({ currentSection, previousSection }: OnePageNav) => {
        return currentSection != previousSection;
    };

    static noneActive = ({ currentSection }: OnePageNav) => {
        return currentSection == undefined;
    };
}

class DebugLine {
    private debugLine: HTMLElement | undefined;

    constructor(onePageNav: OnePageNav) {
        this.update(onePageNav.options);
    }

    update({ debugLine, changeOffset }: OnePageNavOptions) {
        if (debugLine) {
            this.debugLine ? this.updateOffset(changeOffset) : this.create();
        } else {
            this.remove();
        }
    }

    updateOffset = (changeOffset: number | undefined) => {
        if (this.debugLine) {
            this.debugLine.style.top = `calc(${changeOffset}% - 2px)`;
        }
    };

    create = () => {
        this.debugLine = document.createElement('div');
        this.debugLine.classList.add('debugLine');
        this.debugLine.setAttribute(
            'style',
            `position: fixed;width: 100%;background: #ff00007a;height: 4px;transition: .6s; top:50%;`
        );
        document.body.appendChild(this.debugLine);
    };

    remove = () => {
        if (this.debugLine) {
            this.debugLine.remove();
            this.debugLine = undefined;
        }
    };
}

export default OnePageNav;
