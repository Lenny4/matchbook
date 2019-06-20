<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Routing\RouterInterface;

class KernelRequestListener
{
    private $session;
    private $router;

    public function __construct(Session $session, RouterInterface $router)
    {
        $this->session = $session;
        $this->router = $router;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        $route = $event->getRequest()->get('_route');
        if (!$event->isMasterRequest() OR $route == 'login') {
            return;
        }
        //if user not login redirect to login
        if ($this->session->get('username') == null OR $this->session->get('password') == null) {
            $event->setResponse(new RedirectResponse($this->router->generate('login')));
        }
    }
}