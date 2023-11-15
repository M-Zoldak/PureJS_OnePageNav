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
declare class OnePageNav implements OnePageNavInterface {
    previousSection: HTMLElement | undefined;
    currentSection: HTMLElement | undefined;
    sections: Array<HTMLElement>;
    options: OnePageNavOptions;
    private elementDefaultActive?;
    private newlyInitialized;
    private navLinks;
    private debugLine?;
    constructor(options?: OnePageNavOptions);
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
    findLinks: (selector: string) => void;
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
export default OnePageNav;
