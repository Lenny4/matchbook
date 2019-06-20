<?php

namespace App\Controller;

use App\Entity\Account;
use App\Form\AccountType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
        $account = new Account();
        $form = $this->createForm(AccountType::class, $account);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $accountRepo = $em->getRepository("App\Entity\Account");
            if ($accountRepo->accountExist($account->getUsername(), $account->getPassword()) == 0) {
                $em->persist($account);
                $em->flush();
            }
            $request->getSession()->set('username', $account->getUsername());
            $request->getSession()->set('password', $account->getPassword());
            return $this->redirectToRoute('main');
        }

        return $this->render('login/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
