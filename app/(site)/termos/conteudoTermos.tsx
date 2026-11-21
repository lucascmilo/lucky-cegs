import type { ReactNode } from "react";

// === Seção: Tipos ===
type SecaoTermos = {
  id: string;
  numero: string;
  titulo: string;
  // Título do índice, com quebra de linha manual
  tituloIndice: string;
  itens: ReactNode[];
};

// === Seção: Introdução ===
export const INTRODUCAO_TERMOS =
  "A Lucky CEGs é uma comunidade criada com o objetivo de ajudar você a aumentar sua coleção em um ambiente seguro, organizado e amigável. Nossos termos foram elaborados para garantir uma experiência mais tranquila, organizada e eficiente para todos os nossos joiners <3 Pedimos, por favor, que leia tudo com atenção antes de participar das nossas CEGs.";

// === Seção: Regras ===
// Para editar os termos, altere só este arquivo (<strong> para negrito).
export const SECOES_TERMOS: SecaoTermos[] = [
  {
    id: "geral",
    numero: "01",
    titulo: "Geral",
    tituloIndice: "Geral",
    itens: [
      "Entre em nossas CEGs com paciência. Infelizmente, é um processo demorado, mas essa é a forma mais segura de trazer os itens para vocês.",
      "Se você é um comprador muito sensível a atrasos ou não confia em CEGs, pedimos, por favor, que não compre conosco.",
      "No momento, os pagamentos são realizados apenas via Pix.",
      "Dê claim apenas se tiver certeza da compra. Não realizamos cancelamentos, então se certifique de que possui o valor necessário antes de dar claim em um item.",
      "Não toleramos grosseria, desrespeito ou qualquer tipo de confusão dentro da comunidade. Caso isso aconteça, o membro será banido.",
      "Nossos envios nacionais são feitos via carta registrada ou Superfrete.",
      "Caso o seu item fique parado ou aconteça qualquer outro problema relacionado ao transporte, não adianta nos cobrar, pois essas situações fogem completamente do nosso controle.",
    ],
  },
  {
    id: "repasses",
    numero: "02",
    titulo: "Repasses",
    tituloIndice: "Repasses",
    itens: [
      <>
        Ele pode ser feito <strong>APENAS</strong> após o pagamento da compra.
      </>,
      "É necessário entrar em contato com os staffs para avisar sobre o repasse antes de você divulgá-lo, dessa forma teremos um controle maior e conseguiremos organizar tudo sem que a situação se torne confusa para todos.",
      "Após o repasse, se certifique de também comunicar aos staffs quem pegou o seu item. É recomendável você nos informar o nome, user e número da pessoa.",
    ],
  },
  {
    id: "nossos-prazos",
    numero: "03",
    titulo: "Nossos prazos",
    tituloIndice: "Nossos\nprazos",
    itens: [
      "Antes de realizar sua compra, esteja ciente de que somos muito criteriosos com prazos e exigimos responsabilidade e comprometimento de todos os compradores. Pedimos que participe apenas se tiver certeza de que conseguirá acompanhar as atualizações e cumprir os pagamentos dentro do prazo estabelecido.",
      <>
        Não toleramos atrasos de pagamento sem aviso prévio. Caso não haja comunicação antecipada, será feito um
        feedback negativo por timewaste e, se o pagamento não for realizado no prazo de até uma semana, você será{" "}
        <strong>banido</strong> da comunidade.
      </>,
      <>
        Atraso do pagamento causará em uma taxa de <strong>R$ 1,50 por dia.</strong> Após uma semana, seu item será{" "}
        <strong>repassado.</strong>
      </>,
      <>
        Caso o envio nacional do seu item não seja solicitado dentro do prazo de <strong>dois meses</strong>, ele será{" "}
        <strong>repassado</strong>. Se você possuir outros itens conosco em caixas diferentes e quiser aguardar a chegada
        deles para realizar um envio conjunto, isso é permitido, desde que nos avise com antecedência.
      </>,
    ],
  },
  {
    id: "servico-de-procura",
    numero: "04",
    titulo: "Serviço de procura",
    tituloIndice: "Serviço\nde procura",
    itens: [
      "Nosso serviço de procura, ou pedido individual, é destinado para quem deseja comprar algum item que não foi anunciado na comunidade.",
      "Basta entrar em contato conosco informando qual item você procura. Iremos verificar se é possível realizar a compra e trazer o item em nossa caixa. Caso seja possível, começaremos a busca para você.",
      "É só enviar uma foto do item desejado (photocard, álbum, merch, etc.) que faremos a procura.",
      "O valor a ser pago será o preço do item + uma taxa de serviço de R$2,50.",
    ],
  },
];
