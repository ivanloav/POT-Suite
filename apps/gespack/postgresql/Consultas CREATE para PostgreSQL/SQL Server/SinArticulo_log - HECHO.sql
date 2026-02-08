USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[SinArticulo_log]    Script Date: 02/11/2024 11:14:15 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SinArticulo_log](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[PEDIDO] [nvarchar](255) NULL,
	[REFERENCIA] [nvarchar](255) NULL,
	[LINEA_PEDIDO] [int] NULL,
	[CANT] [int] NULL,
	[DATE_CREATION] [datetime] NULL,
	[CREATED_BY] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


