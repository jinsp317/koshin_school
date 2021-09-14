<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'northgate' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '.TuvxzfY.abVj$1jN/ypam:35esbTgoTrm,3e#w({};u&:1=VCZrA2RC5XmC06rj' );
define( 'SECURE_AUTH_KEY',  '0gpX8S$L.Rg@Z7 UIMA68=7Mn@,]hrM?/;Z/v1QNe;6D}9<s-S?_J+zlq@>JDtDB' );
define( 'LOGGED_IN_KEY',    'Jn~iOTGh+ I#$)4RqWY?MA`b^4X^?x@uehv]14YvM+1xACI5oZhZ]?3x8qsZ{VKM' );
define( 'NONCE_KEY',        '?(>>2[;|g6#N6G%Rt1ExA4zm>$^L ~0ejL-uJwbQGF,I?l`J(29HDl/Oh+QUo@QJ' );
define( 'AUTH_SALT',        'g)7~X5j9t7GFCU<f>e0[!b8 w;BKC*^-]V}`7nalU-FxAx49k2;,k,VIp}+f^er%' );
define( 'SECURE_AUTH_SALT', 'cQSUmDTKYvzQM(,pRl2Y!c@WunTl5*ka|~2?I##_#WBjV/{),gLH9d>XuKPq#?PX' );
define( 'LOGGED_IN_SALT',   'T7xD^<Jk0BM3_m83,>Kg_/aw|b^j=wkKgtiC:uM-kxj&p1W_hVd<rg_@.SU>N$q!' );
define( 'NONCE_SALT',       'D)%)g9X:j8xUa}Q}S;O: AkI~Eefz^y(@Pep[<UCvvox:z!Yz8  !qbZ/t]H-aif' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
