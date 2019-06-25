<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/login")
 */
class LoginController extends AbstractController
{
    /**
     * @Route("", name="login")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function login(Request $request)
    {
        $form = $this->createFormBuilder()
            ->add('username', TextType::class)
            ->add('password', PasswordType::class)
            ->add('login', SubmitType::class)
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            if ($data['username'] == $this->getParameter('username') AND $data['password'] == $this->getParameter('password')) {
                $request->getSession()->set('username', $data['username']);
                $request->getSession()->set('password', $data['password']);
            }
            return $this->redirectToRoute('main');
        }

        return $this->render('login/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
