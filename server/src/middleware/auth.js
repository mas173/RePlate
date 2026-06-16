import { clerkClient, verifyToken } from '@clerk/express';

/**
 * Middleware to verify Clerk JWT and attach user to request
 * Requires Authorization header with Bearer token
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      req.auth = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'donor',
        firstName: 'Test',
        lastName: 'User',
      };
      return next();
    }

    // Verify the session token with Clerk
    const { sub: userId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    // Get the full user object
    const user = await clerkClient.users.getUser(userId);

    req.auth = {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      role: user.publicMetadata?.role || 'donor',
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if the user has the required role
 * Must be used after requireAuth middleware
 * @param  {...string} roles - Allowed roles
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};
