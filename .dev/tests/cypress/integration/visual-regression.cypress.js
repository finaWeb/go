
function captureDocument( path = '' ) {
    // Disable scroll-behavior as it prevents reliable full-page screenshots.
    cy.get('html').invoke('css', 'scroll-behavior', 'auto');

    [
        { label: 'go-huge', width: 1440, height: 1080 },
        { label: 'go-large', width: 960, height: 1080 },
        { label: 'go-medium', width: 782, height: 1080 },
        { label: 'go-small', width: 600, height: 1080 },

    ].forEach( viewport => {
        cy.viewport( viewport.width, viewport.height );
        cy.matchImageSnapshot( `${path}/${viewport.label}` );
    } );
}

function screenshotPathFromUrl( url ) {
    const urlSlashIt = url.replace( Cypress.env( 'templateGalleryEndpoint' ).replace(/\/$/, '/'), '' );
    const urlParts = new URL( urlSlashIt );

    return [
        urlParts.searchParams.get( 'lang' ),
        urlParts.searchParams.get( 'template' ),
        urlParts.searchParams.get( 'style' ),
        Cypress.browser.name,
        unslashit( urlParts.pathname ) || 'frontpage',
    ].join( '/' );
}

function unslashit( path ) {
    return path.replace( /(^[\/]+|[\/]+$)/, '' );
}

describe( 'Template gallery regression testing', () => {
    let templates;
    let pages = [];

    before( () => {
        cy.request( [
            unslashit( Cypress.env( 'templateGalleryEndpoint' ) ),
            'templates'
        ].join( '/' ) )
        .its( 'body' )
        .should( 'exist' )
        .then( ( list ) => {
            templates = list;
        } );
    } );

    it( 'Loads template home pages', () => {
        templates.forEach( template => {
            template.styles.forEach( style => {
                cy.visit( style.preview_url );
                captureDocument( screenshotPathFromUrl( style.preview_url ) );

                cy.get( '#header__navigation' ).then( $headerNavigation => {
                    [ ...$headerNavigation.find( '.menu-item a' ) ].forEach( $navLink => {
                        pages.push( $navLink.href );
                    } );
                } );
            } );
        } );
    } );

    it( 'Loads additional pages', () => {
        pages.forEach( page => {
            cy.visit( page );
            captureDocument( screenshotPathFromUrl( page ) );
        } );
    } );

} );