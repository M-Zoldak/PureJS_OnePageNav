interface OnePageNavOptions {
    [key: string]: any;
    navLinksSelector: string;
    navLinkActiveClass: string;
    sectionActiveClass: string;
    defaultActiveElement?: string;
    changeOffset: number;
    defaultLinkActive: boolean;
    updateATagClass: boolean;
    setClassesOnSections: boolean;
    exactMatch: boolean;
    updateHash: boolean;
    saveHashBetweenSections: boolean;
    parentsObtainingActiveClass: Array<string>;
    onInit: Array<Function>;
    onChange: Array<Function>;
    debugLine: boolean;
}
/**
 * @options
 * @param {string} navLinksSelector - selector targeting anchor tags
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
 * @link More about script - https://github.com/Matheoz-sys/PureJS_onePageNav/wiki/About
 *
 * @copyright Copyright (c) 2023 Mateusz Żołdak
 * @license licensed under MIT license
 */
declare class OnePageNav {
    previousSection: HTMLElement | undefined;
    currentSection: HTMLElement | undefined;
    sections: Array<HTMLElement>;
    options: OnePageNavOptions;
    private elementDefaultActive?;
    private newlyInitialized;
    private navLinks;
    private debugLine?;
    defaults: OnePageNavOptions;
    constructor(options: OnePageNavOptions);
    /**
     * @description use to change script behavior and initialize with new values
     * @param {string} key
     * @param {string} value
     */
    set: (key: string, value: any) => void;
    /**
     * @description initializes values once again
     */
    refresh: () => void;
    initialize: () => void;
    findLinks: () => void;
    findRelatedSections: () => void;
    handleScrollListener: () => void;
    handleOutput: () => void;
    firstSectionAbove: () => HTMLElement | undefined;
    findCurrentSection: () => HTMLElement | undefined;
    updateCurrentSection: (newSection: Element | undefined) => void;
    clearClasses: () => void;
    handleDefaultLinkActive: () => void;
    handleHash: () => void;
    handleSectionClasses: () => void;
    addActiveClassesOnNavigationLinks: () => void;
    allLinksIncludingHash: (links: Array<HTMLAnchorElement>, hash: string) => HTMLAnchorElement[];
    addActiveClass: (aElement: HTMLElement) => void;
    removeActiveClass: (aElement: HTMLElement) => void;
    findElementDefaultActive: () => void;
    handleOnInitCallbacks: () => void;
    handleOnChangeCallbacks: () => void;
    handleDebugLine: () => void;
}
declare class Offset {
    static position: ({ changeOffset }: OnePageNavOptions) => number;
    static belowSection: (pageNavObj: OnePageNav, section: HTMLElement) => boolean;
    static belowSectionOffsetTop: (pageNavObj: OnePageNav, section: HTMLElement) => boolean;
    static aboveSection: (pageNavObj: OnePageNav, section: HTMLElement) => boolean;
    static aboveSectionOffsetBottom: (pageNavObj: OnePageNav, section: HTMLElement) => boolean;
    static passedBeginningOfFirstSection: (pageNavObj: OnePageNav) => boolean;
    static exactlyInsideSection: (pageNavObj: OnePageNav, section: HTMLElement) => boolean;
    static posYFromPageTop: (section: HTMLElement) => number;
}
declare class Section {
    static exist: (section: HTMLElement) => boolean;
    static hasChanged: ({ currentSection, previousSection }: OnePageNav) => boolean;
    static noneActive: ({ currentSection }: OnePageNav) => boolean;
}
export { OnePageNav, Offset, Section };
